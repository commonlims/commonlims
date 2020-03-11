#!/bin/bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Check if docker is installed and of the expected version
${DIR}/version-check.py docker

docker swarm init 2> /dev/null || true
docker stack rm clims 2> /dev/null || true

# Remove volumes (they can be read in from cache afterwards)
docker volume rm -f clims_pgdata
