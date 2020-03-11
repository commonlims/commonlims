import os
import re
import json
import hashlib
from subprocess import check_output


# calculate a hash of all migration files + the version of camunda we're using
migration_dirs = [
    "src/clims/migrations/",
    "src/sentry/migrations/",
]


def files():
    for d in migration_dirs:
        for f in os.listdir(d):
            if f.endswith(".py"):
                yield os.path.join(d, f)

    yield "src/clims/migrations/camunda"


def calc_hash():
    sha1 = hashlib.sha1()
    for fpath in files():
        with open(fpath) as fs:
            sha1.update(fs.read())
    return sha1.hexdigest()


# Now, take a backup of the current state of the postgres docker volume and save it using the hash
def create_cache_dir():
    cache_dir = os.path.expanduser("~/.clims/migration-cache")
    try:
        os.makedirs(cache_dir)
    except OSError:
        pass
    print("Cache files are kept at {}".format(cache_dir))
    return cache_dir


cache_dir = create_cache_dir()


def find_docker(name_pattern):
    ids = check_output(["docker", "ps", "-q"]).split("\n")
    for instance in ids:
        if not instance.strip():
            continue
        x = check_output(["docker", "inspect", instance])
        j = json.loads(x)[0]
        if re.match(name_pattern, j['Name']):
            yield j


def docker_container(pattern):
    # Finds the required docker container
    result = [x['Name'] for x in find_docker(".*clims_db.*")]
    assert len(result) == 1
    return result[0]


def get_backup_file_path():
    sha1 = calc_hash()
    return "backup-{}.tar".format(sha1)


def cache():
    print("Backing up current state of the db...")
    name = docker_container(".*clims_db.*")
    backup_file = get_backup_file_path()

    fpath = os.path.join(cache_dir, backup_file)
    if os.path.exists(fpath):
        print("Cache file already exists at {}".format(fpath))
        return

    check_output([
        "docker", "run",
        "--rm",
        "--volumes-from", name,
        "-v", "{}:/backup".format(cache_dir),
        "ubuntu",
        "tar", "cvf", "/backup/{}".format(backup_file), "/var/lib/postgresql/data"])


def restore_from_cache():
    """
    Reads cached data based on the state of migration files.

    The cache is read into both databases.
    """
    backup_file = get_backup_file_path()

    if not os.path.exists(backup_file):
        print("Nothing to restore")
        return

    print("Reading in cached data from {}...".format(backup_file))
    name = docker_container(".*clims_db.*")
    check_output([
        "docker", "run",
        "--rm",
        "--volumes-from", name,
        "-v", "{}:/backup".format(cache_dir),
        "ubuntu",
        "bash", "-c", "cd /var/lib/postgresql/data && tar xvf /backup/{} --strip 1".format(backup_file)])
    print("Data has been restored from the cache")


restore_from_cache()
