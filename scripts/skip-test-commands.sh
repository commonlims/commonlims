#!/bin/bash

# For huge refactorings it can be helpful to skip a lot of tests (temporarily!!)
# without changing the codebase

# A workflow for doing this is:
#   make test-python-failing | tee .lasterrors
#   cat lasterrors | skip-test-commands.sh > .skiptests

# conftest.py is set up to skip tests that are in .skiptests

ag "___" | awk '{ print $2 }'
