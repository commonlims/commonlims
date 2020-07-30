# Linting and formatting

The whole project can be linted explicitly at once (python and javascript) by running `make lint`.

Run `./bin/lint --check-deps-only` to check if all dependencies have been installed

## The lint tool

There is a python tool at ./bin/lint which proxies some of the linting tools. It takes care of
routing to different actions based on if it's a CI build or not.

## Javascript linting

The javascript code is linted using `eslint`. Relevant configuration files are:

Explicit command: `make lint-js`

* .eslintignore: Files to be ignored during linting
* .eslintrc.js

## Javascript formatting

The javascript code formatting rules are included

## Python linting

The python code is linted using
