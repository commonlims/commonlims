#!/bin/bash

# Creates the default `lims` org. This is only required temporarily as `sentry` is the default org created in the code and
# during the POC we're not removing that.

echo "WARNING: INTENDED FOR (TEMPORARY) DEVELOPMENT PURPOSES ONLY"
lims createuser --email admin@localhost --password changeit --superuser --no-input
curl --user 'admin@localhost:changeit' -d "name=lims&=slug=lims&agreeTerms=true" -X POST http://localhost:8000/api/0/organizations/
