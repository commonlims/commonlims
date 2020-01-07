#!/bin/bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Check if docker is installed and of the expected version
${DIR}/version-check.py docker

docker swarm init 2> /dev/null || true

cd ${DIR}/../middleware/local

# Ensure that we have a strong password for the clims database(s) and then export those as
# environment variables which will be picked up in stack.yml
eval $(${DIR}/setup-db-user.py clims clims --print)
eval $(${DIR}/setup-db-user.py test_clims test_clims --print)

until docker stack deploy -c ./stack.yml clims
do
    echo "Error while deploying stack, perhaps services are still alive. Trying again..."
    echo "Press CTRL+C to cancel"
    sleep 2
done

# Make sure we can reach the different services (smoke test), in particular postgresql so we
# can run `lims upgrade` directly.

echo "Waiting for postgres (5432) to respond..."
while ! nc -z localhost 5432 </dev/null; do sleep 1; done

echo "Waiting for postgres (5433) to respond..."
while ! nc -z localhost 5433 </dev/null; do sleep 1; done
