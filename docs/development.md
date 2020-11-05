# About

Common LIMS is as an independent open source initiative with SNP&SEQ Uppsala University (part of SciLifeLab) being the first implementing lab. SNP&SEQ is also the main sponsor of the project in that it has dedicated parts of their development team's efforts to work on this project.

# Development

The project is being developed on http://github.com/commonlims/commonlims.

During the first milestone, core devs use a ticket management system internal to SNP&SEQ, but github's issue system will be used after 1.0 has been released.

## Setup

To set up your environment, do the following:

- Install a virtualenv, e.g. Conda (https://conda.io/en/latest/miniconda.html) or pyenv
- Download commonlims snpseq plugins from: https://github.com/Molmed/commonlims-snpseq if you want some plugins to test
- Make sure you've got docker 19.3+ installed

From the root of the 'commonlims' project, run:

- `source devboot`
- alt: `source devboot-conda` # If you want to use conda instead of pyenv

Start required services:

    `make fresh`

This will setup a clean docker environment for all middleware required for local development:

    * Postgresql
    * Redis
    * Elasticsearch
    * Camunda (workflow management)

It will also run migrations and create example data.

You can run `make fresh` at any time to reset all data. Note that the docker images do not retain data after a reset.

Now run:

- `make develop`

From the root of the 'commonlims' project, run: `lims devserver --browser-reload`

CommonLims should be available at: http://localhost:8000/
Camunda should be available at: http://localhost:8080/camunda/app/cockpit

The default login is, `admin@localhost` with the password: `changeit`, or as specified above.

## Subsequent runs

After initial setup, do the following to start your environment:

- Run `source devboot`
- Run `lims init`
- Run `lims devserver --browser-reload`

# Adding models

- Add or edit a model definition under ./src/clims/models/
- Run `lims django makemigrations`
- Run `lims upgrade`

# Resetting the database

You can get a fresh install of your database by running: `make reset-db`

## Create a rest layer

- Add an endpoint class, e.g. `SamplesEndpoint` in e.g. `sentry/api/endpoints/samples.py`
- Add a details class, e.g. `SamplesDetailsEndpoint` in e.g. `sentry/api/endpoints/samples.py`
- Register the route to these endpoints in `sentry/api/urls.py`
- Create serializers for the domain objects in `sentry/api/serializers/models/samples.py`

# Adding framework tests

Testing is currently almost only in form of integration tests, that at a minimum require postgres (and Django). The plan is to move these gradually to conform to the following:

## Must-have tests

* Endpoint tests (tests/clims/api/endpoints) should be integration tests, requiring various middleware, e.g. postgres. These generally require no mocking but do require cleanup code or be run in transactions.
* Browser based integration tests (Selenium) for all use cases

## Should-have tests

Adding these types of unit tests can aid in development, as they are more focused on particular functionality and run faster:

* UI component unit tests with mocked redux stores (tests/js/spec/components)
* Serializer unit tests (tests/clims/api/serializers)
* Service tests (tests/clims/services). Are unit tests as we want to test the business logic within the service with mocked data. Queries to the db layer should be mocked, as well as any other calls to backends.
* Thick objects (tests/clims/models) are unit tests. These test that objects such as those that inherit from SubstanceBase work correctly. These are strongly related to the service tests as they may expose service logic. Note that db models do not need to be tested.

## Could-have tests

Other tests can be added as requried if the developer feels that they are required, but remember that they add to the complexity of the project as they have to be maintained.

# Adding workflows

(TODO: Add more details)

- Modify your workflow in Camunda modeler
- Run `lims upgrade`

# Frontend development

See [frontend.md](frontend.md)

# Code quality

See [./development/code-quality.md](code-quality.md)

# Troubleshooting

Some problems are difficult to track down because of e.g. caching in different layers, mismatched
dependencies and so on. You can do this to fully reset the application:

```
make reset-db
make develop
lims upgrade  # to execute all plugin-defined dependencies
# run in a clean browser session (clear cookies)
```
