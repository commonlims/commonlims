#!/usr/bin/env python

from __future__ import absolute_import, print_function
import sys
import re
import six
from subprocess import check_output


def to_string(ver):
    if not ver:
        return ""
    return ".".join([six.text_type(c) for c in ver])


def exit_if_not_within(ver, min_ver, max_ver=None):
    if ver < min_ver or (max_ver and ver > max_ver):
        versions = [to_string(v) for v in [ver, min_ver, max_ver]]
        print("Version {} doesn't fall into the range [{},{}]".format(*versions),  # noqa
                file=sys.stderr)
        sys.exit(1)


def docker():
    """
    Checks if docker is of the expected version
    """
    pattern = r"Docker version (\d+)\.(\d+)\.(\d+)"
    version_string = check_output(["docker", "--version"]).decode('ascii')
    m = re.match(pattern, version_string)
    version = tuple(int(i) for i in m.groups())
    exit_if_not_within(version, (19, 3))


checks = [
    docker
]


def main():
    try:
        pattern = sys.argv[1]
    except IndexError:
        print("Usage: version-check.py <regex>")  # noqa

    for check in checks:
        if re.match(pattern, check.__name__):
            print("Checking version of {}".format(check.__name__))  # noqa
            check()


if __name__ == '__main__':
    main()
