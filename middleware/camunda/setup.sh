#!/bin/bash

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

echo "Overwriting config files..."
cp -f ./local-server.xml ~/.camunda/server/apache-tomcat-9.0.19/conf/server.xml

echo "Fetching postgres driver..."
cd ~/.camunda/server/apache-tomcat-9.0.19/lib
wget -nc https://jdbc.postgresql.org/download/postgresql-42.2.6.jar

echo 'Server is ready.'
echo '- Startup: ~/.camunda/server/apache-tomcat-9.0.19/bin/startup.sh'
echo '- Logs: vi $(ls -1t ~/.camunda/server/apache-tomcat-9.0.19/logs/*)'
