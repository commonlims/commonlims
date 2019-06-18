#!/bin/bash

# "Rebases" migrations, i.e. removes all migrations you've created and
# creates new ones.

git diff-index --quiet HEAD
res=$?

if [ "$res" -ne "0" ]; then
    echo "Can't rebase migrations if there are uncommitted files"
    exit 1
fi

rm $(git diff origin/develop --name-only -- ./src/clims/migrations)

lims django makemigrations

echo New migrations have been created but are uncommitted
