#!/bin/bash

set -e
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

CAMUNDA_VERSION_NO_PATCH=$(python -c "print('.'.join('${CAMUNDA_VERSION}'.split('.')[:2]))")

# NOTE: We install Camunda from source only to get the sql code required to install it. The
# server is run using the docker image
CAMUNDA_SERVER_PATH=~/.camunda/server/${CAMUNDA_VERSION}
mkdir -p ${CAMUNDA_SERVER_PATH}

CAMUNDA_MODELER_VERSION=3.2.3
CAMUNDA_MODELER_PATH=~/.camunda/modeler/${CAMUNDA_MODELER_VERSION}
mkdir -p ${CAMUNDA_MODELER_PATH}

if [ ! -d ${CAMUNDA_SERVER_PATH}/server ]; then
    echo "Installing Camunda..."
    cd ${CAMUNDA_SERVER_PATH}
    echo "--> downloading"
    wget -nc https://camunda.org/release/camunda-bpm/tomcat/${CAMUNDA_VERSION_NO_PATCH}/camunda-bpm-tomcat-${CAMUNDA_VERSION}.zip
    echo "--> unzipping"
    unzip camunda-bpm-tomcat-${CAMUNDA_VERSION}.zip
fi

echo "Camunda (source) v${CAMUNDA_VERSION} has been installed"

if [ ! -d ${CAMUNDA_MODELER_PATH}/camunda-modeler-${CAMUNDA_MODELER_VERSION}-linux-x64 ]; then
    echo "Installing modeler..."
    cd ${CAMUNDA_MODELER_PATH}
    wget -nc https://camunda.org/release/camunda-modeler/${CAMUNDA_MODELER_VERSION}/camunda-modeler-${CAMUNDA_MODELER_VERSION}-linux-x64.tar.gz
    tar xzvf camunda-modeler-${CAMUNDA_MODELER_VERSION}-linux-x64.tar.gz
fi
echo "Camunda modeler v${CAMUNDA_MODELER_VERSION} has been installed"

# TODO: Implement an upgrade path between camunda versions
CREATE_SCRIPT=~/.camunda/server/${CAMUNDA_VERSION}/sql/create/postgres_engine_${CAMUNDA_VERSION}.sql

psql -h localhost -p 5432 -d clims -U clims -a -f $CREATE_SCRIPT > /dev/null 2>&1
echo "Camunda SQL v${CAMUNDA_VERSION} has been deployed to clims"

psql -h localhost -p 5433 -d test_clims -U test_clims -a -f $CREATE_SCRIPT > /dev/null 2>&1
echo "Camunda SQL v${CAMUNDA_VERSION} has been deployed to test_clims"
