# About

Common LIMS is as an independent open source initiative with SNP&SEQ Uppsala University (part of SciLifeLab) being the first implmementing lab. SNP&SEQ is also the main sponsor of the project in that it has dedicated parts of their development team's efforts to work on this project.

# Development

Development happens on gitlab.org/commonlims and will be moved to github.com/commonlims and made open to the public after the first milestone.

## Setup

To set up your environment, do the following:
- Download and install Conda from: https://conda.io/en/latest/miniconda.html
- Download commonlims snpseq plugins from: https://github.com/Molmed/commonlims-snpseq
- Download and install Camunda from: https://camunda.com/download/

Start required services:
- postgres server (specific to your installation)
- redis server (specific to your installation)
- `sudo /path/to/camunda/start-camunda.sh`

You may also need to create a postgres user that matches your Unix username:
- `sudo -i -u postgres`
- `psql template1 postgres -c 'CREATE USER "[your-unix-username]" SUPERUSER;'`

From the root of the 'commonlims' project, run:
- `source devboot.sh`
- `make develop`

Ensure that your 'commonlimsN" conda environment is activated. Then, from the root of the 'commonlims-snpseq' project, run: `pip install .`

From the root of the 'commonlims' project, run: `lims devserver --browser-reload`

Sentry should be available at: http://localhost:8000/
Camunda should be available at: http://localhost:8080/camunda/app/cockpit

## Subsequent runs

After initial setup, do the following to start your environment:
- Start postgres, redis and camunda services
- Run `source devboot.sh`
- Run `lims devserver --browser-reload`

# Roadmap

## v0.1.0 - Core framework set up (DONE)

* The main building blocks and core roadmap are in place

 * Main design
 * UI
 * Workflow engine
 * Plugin mechanism
 * Several use cases in early draft (authentication, authorization, groups, settings, feature management and more)
 * A large part of the workflows in SNP&SEQ were implemented as POC

A large part of this was achieved so early by leveraging another open source system, https://sentry.io.

## v0.1.0 - A basic use case implemented for SNP&SEQ (CURRENT)

UI general:

* Users can see all queued tasks and limit to only what they will be working on
* Users can select samples to batch process and enter a per-batch workflow.
* Users can enter a specific per-batch subprocess required for SNP&SEQ, fragment_analyzer.

fragment_analyzer:

* Users can position samples as required. This means that a transition graph is created to/from different containers (e.g. sample cont1@a1 => cont2@a1)
* Implement the transition engine (see below for core design)
* Generic UI for FA specific variables
*

# Adding models

During the POC we are still keeping the models in sentry.models.

* Add a model definition under ./src/sentry/models/
* Run `lims django makemigrations --auto`
* Run `lims upgrade`

## Create a rest layer

* Add an endpoint class, e.g. `SamplesEndpoint` in e.g. `sentry/api/endpoints/samples.py`
* Add a details class, e.g. `SamplesDetailsEndpoint` in e.g. `sentry/api/endpoints/samples.py`
* Register the route to these endpoints in `sentry/api/urls.py`
* Create serializers for the domain objects in `sentry/api/serializers/models/samples.py`

# Adding workflows

(TODO: Add more details)

* Modify your workflow in Camunda modeler
* Run `lims upgrade`
