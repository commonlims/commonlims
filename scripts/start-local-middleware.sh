#!/bin/bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

export CAMUNDA_VERSION=7.12.0

# Even though we're using docker, we're currently executing some commands via the exposed
# ports on the host. To make sure we're not using the default postgres instance, we connect
# to 15432 instead (assuming that's not in use)
export POSTGRES_PORT=15432
export POSTGRES_TESTS_PORT=15433


# Check if docker is installed and of the expected version
${DIR}/version-check.py docker

docker swarm init 2> /dev/null || true

cd ${DIR}/../middleware/local

# Ensure that we have a strong password for the clims database(s) and then export those as
# environment variables which will be picked up in stack.yml
eval $(${DIR}/setup-db-user.py clims --print)
eval $(${DIR}/setup-db-user.py test_clims --print)

until docker stack deploy -c ./stack.yml clims
do
    echo "Error while deploying stack, perhaps services are still alive. Trying again..."
    echo "Press CTRL+C to cancel"
    sleep 2
done

# Make sure we can reach the different services (smoke test), in particular postgresql so we
# can run `lims upgrade` directly.


echo "Waiting for postgres (${POSTGRES_PORT}) to respond..."
while ! nc -z localhost ${POSTGRES_PORT} </dev/null; do sleep 1; done

echo "Waiting for postgres (${POSTGRES_TESTS_PORT}) to respond..."
while ! nc -z localhost ${POSTGRES_TESTS_PORT} </dev/null; do sleep 1; done

echo "--> Setting up Camunda"
bash -x $DIR/.././middleware/camunda/setup.sh
