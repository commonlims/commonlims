#!/usr/bin/env python
from __future__ import absolute_import

import os
import argparse
from subprocess import check_output, check_call


def create_password():
    return check_output("openssl rand -base64 32".split(" "))


def pass_file_path():
    return "{}/.pgpass".format(os.environ["HOME"])


def add_entry(hostname, port, database, username):
    """
    Adds the entry if required and returns the password
    """
    prefix = ":".join([hostname, port, database, username])
    with open(pass_file_path(), 'a+') as fs:
        for line in fs:
            if line.startswith(prefix):
                entries = line.split(":")
                return entries[4]

        # If here, the entry doesn't exist, append to the file:
        passw = create_password()
        passw = passw.strip()
        fs.write("{}:{}{}".format(prefix, passw, os.linesep))
        return passw


def psql_cmd(command, database="postgres"):
    # NOTE: We have to add the host because we're connecting to docker
    return ["psql", "-h", "localhost", "-d", database, "-c", command]


def psql(command, database="postgres"):
    devnull = open(os.devnull, 'w')
    check_call(psql_cmd(command, database), stdout=devnull)


def main(database, role, create_role, print_variables):
    """
    Creates the role in the database if it doesn't exist and synching it with the password
    in the password file.
    """
    passw = add_entry("localhost", "*", database, role)
    passw = passw.strip()
    if print_variables:
        prefix = database.upper()
        print("{0}_POSTGRES_DB={1}; export {0}_POSTGRES_DB".format(prefix, database))  # noqa
        print("{0}_POSTGRES_USER={1}; export {0}_POSTGRES_USER".format(prefix, role))  # noqa
        print("{0}_POSTGRES_PASSWORD={1}; export {0}_POSTGRES_PASSWORD".format(prefix, passw))  # noqa

    if create_role:
        psql("DROP ROLE IF EXISTS {0}; CREATE ROLE {0} WITH LOGIN;".format(role))
        psql("ALTER ROLE {} WITH SUPERUSER;".format(role))
        psql("ALTER ROLE {} WITH LOGIN ENCRYPTED PASSWORD '{}'".format(role, passw))
    set_permissions()


def set_permissions():
    os.chmod(pass_file_path(), 0o600)


parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('database', help='the database the entry is for')
parser.add_argument('role', help='the database role')
parser.add_argument('--create-role', dest='create_role', action='store_true',
        help='if present, a role will be created in the database with the same password')
parser.add_argument('--print', dest='print_variables', action='store_true',
        help='print the variables to be set to stdout')

args = parser.parse_args()
main(args.database, args.role, args.create_role, args.print_variables)
