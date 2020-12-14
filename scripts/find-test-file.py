#!/usr/bin/env python

"""
Writes out the test files that are required for the list of files on stdin. Nothing is written if
the source file doesn't require a test.

Currently, only endpoint tests and serializer tests are in the required list

Examples:

Create a required test file for all files that have been added in the current branch
    (if it was branched off develop):

    git diff develop.. --no-renames --name-status | grep -v "^D" | awk '{print $2}' | ./scripts/find-test-file.py | xargs touch

Create a required (empty) test file for all clims endpoints:

    find src/clims/api/endpoints/ -type f | ./scripts/find-test-file.py | xargs touch

Open a test file given its source file

    vim $(./scripts/find-test-file.py src/clims/api/endpoints/work.py)
"""

import os
import sys

required_tests = [
    "src/clims/api/endpoints/",
    "src/clims/api/serializers/models/",
]


def src_path_to_test(src_path):
    if src_path.endswith(".py"):
        src_path, src_file = os.path.split(src_path)
    else:
        src_file = None
    parts = src_path.split(os.sep)
    parts.append("test_" + src_file)
    return os.path.join("tests", *parts[1:])


def is_source_file(f):
    _, fname = os.path.split(f)
    return fname.endswith(".py") and fname != "__init__.py"


def get_source_files(path):
    source_files = [os.path.join(path, f) for f in os.listdir(path)]
    return [source_file for source_file in source_files if is_source_file(source_file)]


def should_have_test(path):
    for req in required_tests:
        if path.startswith(req) and is_source_file(path):
            return True
    return False


if len(sys.argv) >= 2:
    f = sys.argv[1]
    if should_have_test(f):
        print(src_path_to_test(f))
else:
    # read from stdin
    for path in sys.stdin:
        path = path.strip()
        if should_have_test(path):
            print(src_path_to_test(path))
