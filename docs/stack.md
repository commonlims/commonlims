Common LIMS is (like any modern web app) composed of several independent pieces of technology that interact together. In order to truly understand how each piece works, refer to the documentation of that piece, but here we'll give an overview of some of the most important pieces.

Since each dev's experience with parts of this stack will probably vary greatly, we'll try to explain every part of it on a high level (even make).

# Development tools

## Make

Make is used to build, clean and test the solution.

Config file: ./Makefile

## git

* pre-commit

## Prettier

The tool Prettier is used to prettify all javascript. Your changes will be automatically prettified when committing.

Config file: ./prettier.config.js

## Webpack

TODO

## Various files

./jsconfig.json: Javscript config for VSCode

TODO:
setup.cfg
setup.py
stylelint.config.js

# Frontend

## Node

Node is used for executing javascript code on development workstations and build machines. It's not used as a server component in production.

Node's package manager is `npm`.

## npm

npm is Node's package manager and is used to install all javascript requirements. Note that yarn is also used. The reason for this is unclear to me, but in any case, when installing a new package, you should generally follow it by `yarn install`. E.g.:

npm install --save-dev webpack-dev-server; yarn install

## Babel

Babel is used to transpile from modern JS to a version of javascript that works in most browsers.

Babel is set up to use different plugins to support other features, such as emotion, which is used to write css in javascript. It's also used to support hot reloading of React components in the browser.

Config file: ./babel.config.js
More info: https://babeljs.io/docs/en/

## Jest

Jest is used for testing javascript code.

Config file: ./jest.config.js
More info: https://jestjs.io/docs/en/getting-started

## React/redux architecture

See [frontend.md](frontend.md)

# Backend

# Middleware

We'll use the term middleware to mean components that we don't change programmatically (but perhaps with configuration).

## Postgresql

All data is kept in postgresql.

The DB backend can be changed but that's not officially supported by the framework for simplicity.

NOTE: For the time being, Camunda's data is kept separately, but that's just for the period of the POC.

More info: https://www.postgresql.org/

### Access

The postgresql instance is set up when you run `make middleware`. Note that if you need to access the database with the `psql` tool, you must add `-h localhost` to your command. This is because you're accessing the database with TCP rather than inter process communication (Unix domain sockets).

## Redis

Redis is used for caching and message broking.

More info: https://redis.io/documentation
