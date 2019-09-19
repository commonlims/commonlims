STATIC_DIR = src/sentry/static/sentry

ifneq "$(wildcard /usr/local/opt/libxmlsec1/lib)" ""
	LDFLAGS += -L/usr/local/opt/libxmlsec1/lib
endif
ifneq "$(wildcard /usr/local/opt/openssl/lib)" ""
	LDFLAGS += -L/usr/local/opt/openssl/lib
endif

PIP = LDFLAGS="$(LDFLAGS)" pip
WEBPACK = NODE_ENV=production ./node_modules/.bin/webpack

develop: setup-git develop-only
develop-only: clean setup-camunda node-version-check update-submodules install-yarn-pkgs install-sentry-dev
test: lint test-js test-python test-cli

build: locale

drop-db:
	@echo "--> Dropping existing 'clims' database"
	dropdb clims || true
	@echo "--> Dropping existing 'test_clims' database"
	dropdb test_clims || true

create-db:
	@echo "--> Creating 'clims' database"
	createdb -E utf-8 clims
	@echo "--> Make sure we have user called 'postgres'"
	-psql -d postgres -c "CREATE ROLE postgres WITH LOGIN"
	-psql -d postgres -c "ALTER ROLE postgres WITH SUPERUSER;"

reset-db: clean drop-db create-db
	@echo "--> Applying migrations"
	lims upgrade
	@echo "--> Adding user admin@localhost. WARNING: NOT FOR PRODUCTION USE"
	lims createuser --email admin@localhost --password changeit --superuser --no-input
	@echo "--> Add example data"
	lims createexampledata

clean:
	@echo "--> Cleaning static cache"
	rm -rf dist/* static/dist/*
	@echo "--> Cleaning integration docs cache"
	rm -rf src/sentry/integration-docs
	@echo "--> Cleaning pyc files"
	find . -name "*.pyc" -delete
	@echo "--> Cleaning python build artifacts"
	rm -rf build/ dist/ src/sentry/assets.json
	@echo ""

setup-git:
	@echo "--> Installing git hooks"
	git config branch.autosetuprebase always
	git config core.ignorecase false
	cd .git/hooks && ln -sf ../../config/hooks/* ./
	pip install "pre-commit>=1.18.3,<1.19.0"
	pre-commit install
	@echo ""

setup-camunda:
	@echo "--> Setting up Camunda"
	./middleware/camunda/setup.sh

update-submodules:
	@echo "--> Updating git submodules"
	git submodule init
	git submodule update
	@echo ""

node-version-check:
	@test "$$(node -v)" = v"$$(cat .nvmrc)" || (echo 'node version does not match .nvmrc. Recommended to use https://github.com/creationix/nvm or `source ./devboot`'; exit 1)

install-system-pkgs: node-version-check
	@echo "--> Installing system packages (from Brewfile)"
	@command -v brew 2>&1 > /dev/null && brew bundle || (echo 'WARNING: homebrew not found or brew bundle failed - skipping system dependencies.')

	# Install dependencies with apt instead.
	# TODO: see if anything else needs to be ported from Brewfile, then remove it
	sudo apt install -y libgeoip1 libgeoip-dev geoip-bin libxmlsec1-dev
	sudo apt install -y redis
	sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" >> /etc/apt/sources.list.d/pgdg.list'
	wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | sudo apt-key add -
	sudo apt-get update
	sudo apt install -y postgresql-9.6

install-yarn-pkgs:
	@echo "--> Installing yarn"
	@npm install -g "yarn@1.16.0"
	@echo "--> Installing yarn packages (for development)"
	# Use NODE_ENV=development so that yarn installs both dependencies + devDependencies
	NODE_ENV=development yarn install --pure-lockfile

install-sentry-dev:
	@echo "--> Installing Sentry (for development)"
	NODE_ENV=development $(PIP) install -e ".[dev,tests,optional]"

build-js-po: node-version-check
	mkdir -p build
	SENTRY_EXTRACT_TRANSLATIONS=1 $(WEBPACK)

locale: build-js-po
	cd src/sentry && sentry django makemessages -i static -l en
	./bin/merge-catalogs en
	./bin/find-good-catalogs src/sentry/locale/catalogs.json
	cd src/sentry && sentry django compilemessages

update-transifex: build-js-po
	$(PIP) install transifex-client
	cd src/sentry && sentry django makemessages -i static -l en
	./bin/merge-catalogs en
	tx push -s
	tx pull -a
	./bin/find-good-catalogs src/sentry/locale/catalogs.json
	cd src/sentry && sentry django compilemessages

build-platform-assets:
	@echo "--> Building platform assets"
	sentry init
	@echo "from sentry.utils.integrationdocs import sync_docs; sync_docs(quiet=True)" | sentry exec

fetch-release-registry:
	@echo "--> Fetching release registry"
	sentry init
	@echo "from sentry.utils.distutils import sync_registry; sync_registry()" | sentry exec

test-cli:
	@echo "--> Testing CLI"
	rm -rf test_cli
	mkdir test_cli
	cd test_cli && sentry init test_conf > /dev/null
	cd test_cli && sentry --config=test_conf upgrade --traceback --noinput > /dev/null
	cd test_cli && sentry --config=test_conf help 2>&1 | grep start > /dev/null
	rm -r test_cli
	@echo ""

build-static-assets:
	@echo "--> Building static assets"
	@$(WEBPACK) --profile --json > .artifacts/webpack-stats.json
	@echo ""

test-js: node-version-check build-static-assets
	@echo "--> Running JavaScript tests"
	@npm run test-ci
	@echo ""

test-js-clean: node-version-check build-static-assets
	@echo "--> Running tests and updating snapshots"
	@npm run test-ci-clean
	@echo ""

# builds and creates percy snapshots
test-styleguide:
	@echo "--> Building and snapshotting styleguide"
	@npm run snapshot
	@echo ""

test-python: clean
	@echo "--> Running Python tests"
	py.test tests/integration tests/sentry tests/clims --cov . --cov-report="xml:.artifacts/python.coverage.xml" --junit-xml=".artifacts/python.junit.xml" || exit 1
	@echo ""

test-python-failed:
	@echo "--> Running Python tests - failed only"
	py.test tests/integration tests/sentry tests/clims --last-failed || exit 1
	@echo ""

test-snuba:
	@echo "--> Running snuba tests"
	py.test tests/snuba tests/sentry/eventstream/kafka -vv --cov . --cov-report="xml:.artifacts/snuba.coverage.xml" --junit-xml=".artifacts/snuba.junit.xml"
	@echo ""

test-acceptance: build-platform-assets node-version-check
	@echo "--> Building static assets"
	@$(WEBPACK) --display errors-only
	@echo "--> Running acceptance tests"
	py.test tests/acceptance --cov . --cov-report="xml:.artifacts/acceptance.coverage.xml" --junit-xml=".artifacts/acceptance.junit.xml" --html=".artifacts/acceptance.pytest.html"
	@echo ""

lint: lint-python lint-js

lint-python:
	@echo "--> Linting python"
	bash -eo pipefail -c "flake8 | tee .artifacts/flake8.pycodestyle.log"
	@echo ""

lint-js:
	@echo "--> Linting javascript"
	bin/lint --js --parseable
	@echo ""

publish:
	python setup.py sdist bdist_wheel upload


.PHONY: develop develop-only test build test reset-db clean setup-git update-submodules node-version-check install-system-pkgs install-yarn-pkgs install-sentry-dev build-js-po locale update-transifex build-platform-assets test-cli test-js test-styleguide test-python test-snuba test-acceptance lint lint-python lint-js publish


############################
# Halt, Travis stuff below #
############################

.PHONY: travis-noop
travis-noop:
	@echo "nothing to do here."

.PHONY: travis-lint-sqlite travis-lint-postgres travis-lint-mysql travis-lint-acceptance travis-lint-snuba travis-lint-js travis-lint-cli travis-lint-dist
travis-lint-sqlite: lint-python
travis-lint-postgres: lint-python
travis-lint-mysql: lint-python
travis-lint-acceptance: travis-noop
travis-lint-snuba: lint-python
travis-lint-js: lint-js
travis-lint-cli: travis-noop
travis-lint-dist: travis-noop

.PHONY: travis-test-sqlite travis-test-postgres travis-test-mysql travis-test-acceptance travis-test-snuba travis-test-js travis-test-cli travis-test-dist
travis-test-sqlite: test-python
travis-test-postgres: test-python
travis-test-mysql: test-python
travis-test-acceptance: test-acceptance
travis-test-snuba: test-snuba
travis-test-js: test-js
travis-test-cli: test-cli
travis-test-dist:
	# NOTE: We quiet down output here to workaround an issue in travis that
	# causes the build to fail with a EAGAIN when writing a large amount of
	# data to STDOUT.
	# See: https://github.com/travis-ci/travis-ci/issues/4704
	SENTRY_BUILD=$(TRAVIS_COMMIT) SENTRY_LIGHT_BUILD=0 python setup.py -q sdist bdist_wheel
	@ls -lh dist/

.PHONY: scan-python travis-scan-sqlite travis-scan-postgres travis-scan-mysql travis-scan-acceptance travis-scan-snuba travis-scan-js travis-scan-cli travis-scan-dist
scan-python:
	@echo "--> Running Python vulnerability scanner"
	$(PIP) install safety
	bin/scan
	@echo ""

travis-scan-sqlite: scan-python
travis-scan-postgres: scan-python
travis-scan-mysql: scan-python
travis-scan-acceptance: travis-noop
travis-scan-snuba: scan-python
travis-scan-js: travis-noop
travis-scan-cli: travis-noop
travis-scan-dist: travis-noop
