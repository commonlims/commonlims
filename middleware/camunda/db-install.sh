#!/bin/bash

SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

SCRIPT=~/.camunda/sql/create/postgres_engine_7.11.0.sql

# Check that the clims database is there, and it is possible to connect to it.
pg_isready -d clims
if [ $? -eq 0 ]; then
  echo "The clims db appears to be accepting connections"
else
  echo "The clims db does not accept connections. Please make sure you can connect with your $USER, and try again."
  exit 1
fi

echo 'Creating postgres role...'

psql -d clims -c "CREATE ROLE camunda"

# Check if it was possible to create the camunda role. If it was not
# assume it was already there.
if [ $? -eq 0 ]; then
  random_pass=$(openssl rand -base64 32)

  psql -d clims -c "ALTER ROLE camunda WITH LOGIN ENCRYPTED PASSWORD '$random_pass'"

  echo "Overwriting config files..."
  cp -f $SCRIPT_PATH/server.xml ~/.camunda/server/apache-tomcat-9.0.19/conf/server.xml
  perl -pi -e "s#\{\{ postgres_password \}\}#$random_pass#g" ~/.camunda/server/apache-tomcat-9.0.19/conf/server.xml
else
  echo "Camunda user (probably) already existed. Will not overwrite current config"
fi

if [ ! -f $SCRIPT ]; then
    echo "SQL files for Camunda where not found. Please execute middleware/camunda/setup.sh first"
    exit 1
fi

export PGPASSWORD=$(xmlstarlet sel -T -t -m '//Server/GlobalNamingResources/Resource/@password' -v '.' -n ~/.camunda/server/apache-tomcat-9.0.19/conf/server.xml)
psql -U camunda -d clims -a -f $SCRIPT
