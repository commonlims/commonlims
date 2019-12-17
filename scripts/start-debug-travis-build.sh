#!/bin/bash

# Starts a particular job in debug mode, so one can ssh into the VM. This is generally enabled
# on open source (public) builds on request only because of the security concerns explained below.

# NOTE: NEVER USE DEBUG BUILDS IF WE USE SECRET VARIABLES IN THE TRAVIS BUILD. ANYONE CAN
#       LOG INTO THE VM WHERE THESE SECRETS WOULD BE VISIBLE.
#       (CURRENTLY THERE ARE NO SECRETS BEING USED).

curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Travis-API-Version: 3" \
  -H "Authorization: token $TRAVIS_API_TOKEN" \
  -d "{\"quiet\": true}" \
  https://api.travis-ci.com/job/$1/debug
