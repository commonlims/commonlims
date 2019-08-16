#!/bin/bash

set -e

SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# NOTE: Sets up config files and changes the postgres password on every run

mkdir -p ~/.camunda

if [ ! -d ~/.camunda/server ]; then
    echo "Installing Camunda..."
    cd ~/.camunda
    echo "--> downloading"
    wget -nc https://camunda.org/release/camunda-bpm/tomcat/7.11/camunda-bpm-tomcat-7.11.0.zip
    echo "--> unzipping"
    unzip camunda-bpm-tomcat-7.11.0.zip
else
    echo "Camunda has already been installed"
fi

echo "Fetching postgres driver..."
cd ~/.camunda/server/apache-tomcat-9.0.19/lib
wget -nc https://jdbc.postgresql.org/download/postgresql-42.2.6.jar
cd $SCRIPT_PATH

echo 'Creating postgres role...'

set +e
psql -d clims -c "CREATE ROLE camunda"
set -e

random_pass=$(openssl rand -base64 32)

psql -d clims -c "ALTER ROLE camunda WITH LOGIN ENCRYPTED PASSWORD '$random_pass'"

echo "Overwriting config files..."
cp -f ./server.xml ~/.camunda/server/apache-tomcat-9.0.19/conf/server.xml
perl -pi -e "s#{{ postgres_password }}#$random_pass#g" ~/.camunda/server/apache-tomcat-9.0.19/conf/server.xml

echo 'Server is ready.'
echo '- Startup: ~/.camunda/server/apache-tomcat-9.0.19/bin/startup.sh'
echo '- Logs: vi $(ls -1t ~/.camunda/server/apache-tomcat-9.0.19/logs/*)'
