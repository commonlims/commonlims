# About

Common LIMS is as an independent open source initiative with SNP&SEQ Uppsala University (part of SciLifeLab) being the first implmementing lab. SNP&SEQ is also the main sponsor of the project in that it has dedicated parts of their development team's efforts to work on this project.

# Development

Development happens on gitlab.org/commonlims and will be moved to github.com/commonlims and made open to the public after the first milestone.

## Setup

To set up your environment, do the following:

- Install a virtualenv, e.g. Conda (https://conda.io/en/latest/miniconda.html)
- Download commonlims snpseq plugins from: https://github.com/Molmed/commonlims-snpseq

Start required services:

- postgres server (specific to your installation)
- redis server (specific to your installation)

You may also need to create a postgres user that matches your Unix username:

- `sudo -i -u postgres`
- `psql template1 postgres -c 'CREATE USER "[your-unix-username]" SUPERUSER;'`
- Go into `/etc/postgresql/9.6/main/pg_hba.conf` (replace your postgresql version as necessary) and add the following
  line under the "local" section:

```
local   all             camunda                                 password
local   all             clims                                   password
local   all             test_clims                              password
```

- Restart postgres with `sudo service postgresql restart`

From the root of the 'commonlims' project, run:

- `source devboot`
- alt: `source devboot-conda` # If you want to use conda instead of pyenv

Then run:

- `make setup-db-user`
- Add the passwords for `clims` and `test_clims` to ~/.pgpassword (as in structed by the output from the above command)
- `make develop`
- `lims createuser --email admin@localhost --password changeit --superuser --no-input`
- `lims upgrade`

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

# Adding workflows

(TODO: Add more details)

- Modify your workflow in Camunda modeler
- Run `lims upgrade`

# Frontend development

See [frontend.md](frontend.md)

# Troubleshooting

Some problems are difficult to track down because of e.g. caching in different layers, mismatched
dependencies and so on. You can do this to fully reset the application:

```
make reset-db
make develop
lims upgrade  # to execute all plugin-defined dependencies
# run in a clean browser session (clear cookies)
```
