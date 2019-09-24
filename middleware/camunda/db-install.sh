#!/bin/bash

SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

SCRIPT=~/.camunda/sql/create/postgres_engine_7.11.0.sql

echo 'Creating postgres role...'

set +e
psql -d clims -c "CREATE ROLE camunda"
set -e

random_pass=$(openssl rand -base64 32)

psql -d clims -c "ALTER ROLE camunda WITH LOGIN ENCRYPTED PASSWORD '$random_pass'"

echo "Overwriting config files..."
cp -f $SCRIPT_PATH/server.xml ~/.camunda/server/apache-tomcat-9.0.19/conf/server.xml
perl -pi -e "s#\{\{ postgres_password \}\}#$random_pass#g" ~/.camunda/server/apache-tomcat-9.0.19/conf/server.xml


if [ ! -f $SCRIPT ]; then
    echo "SQL files for Camunda where not found. Please execute middleware/camunda/setup.sh first"
    exit 1
fi

psql -U camunda -d clims -a -f $SCRIPT
