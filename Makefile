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
develop-only: clean node-version-check update-submodules install-yarn-pkgs install-clims-dev
test: lint test-js test-python-unit test-python-integration test-cli

build: locale

middleware:
# Sets up all server middleware (postgresql, elasticsearch, redis etc.)
	@./scripts/start-local-middleware.sh

middleware-teardown:
	@./scripts/stop-local-middleware.sh

create-example-data:
	@echo "--> Add example data"
	lims createexampledata

fresh: clean middleware-teardown middleware
# Resets all data (by tearing down the middleware) and then installs new test data
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

update-submodules:
	@echo "--> Updating git submodules"
	git submodule init
	git submodule update
	@echo ""

node-version-check:
	@test "$$(node -v)" = v"$$(cat .nvmrc)" || (echo 'node version does not match .nvmrc. Recommended to use https://github.com/creationix/nvm or `source ./devboot`'; exit 1)

install-system-pkgs: node-version-check
	@echo "--> Installing system packages"
# TODO: Support mac
	sudo apt install -y libxmlsec1-dev

install-yarn-pkgs:
	@echo "--> Installing yarn"
	@npm install -g "yarn@1.16.0"
	@echo "--> Installing yarn packages (for development)"
	# Use NODE_ENV=development so that yarn installs both dependencies + devDependencies
	NODE_ENV=development yarn install --pure-lockfile

install-clims-dev:
	@echo "--> Installing Common LIMS (for development)"
	# Install overrides
	pip install -r requirements-not-pypi.txt
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
	lims init
	@echo "from sentry.utils.integrationdocs import sync_docs; sync_docs(quiet=True)" | lims exec

fetch-release-registry:
	@echo "--> Fetching release registry"
	lims init
	@echo "from sentry.utils.distutils import sync_registry; sync_registry()" | lims exec

test-cli:
	@echo "--> Testing CLI"
	rm -rf test_cli
	mkdir test_cli
	cd test_cli && lims init test_conf > /dev/null
	if [ "${CLIMS_DATABASE_USER}" != "" ]; then \
		cd test_cli && sed -i "s/'USER': 'clims'/'USER': '${CLIMS_DATABASE_USER}'/" ./test_conf/clims.conf.py; \
	fi
	cd test_cli && lims --config=test_conf upgrade --traceback --noinput > /dev/null
	cd test_cli && lims --config=test_conf help 2>&1 | grep start > /dev/null
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

test-python-integration: clean
	@echo "--> Running Python integration tests"
	CLIMS_INTEGRATION_TEST=1 py.test -m "not unit_test" tests/integration tests/sentry tests/clims --cov . --cov-report="xml:.artifacts/python.coverage.xml" --junit-xml=".artifacts/python.junit.xml" || exit 1
	@echo ""

test-python-unit: clean
	@echo "--> Running Python unit tests"
	py.test -m unit_test tests/integration tests/sentry tests/clims --cov . --cov-report="xml:.artifacts/python.coverage.xml" --junit-xml=".artifacts/python.junit.xml" || exit 1
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
	bin/lint --js --cache
	@echo ""

publish:
	python setup.py sdist bdist_wheel upload

# TODO: Temporarily disabled (clims-363)
# scan-python:
# 	@echo "--> Running Python vulnerability scanner"
# 	$(PIP) install safety
# 	bin/scan
# 	@echo ""

.PHONY: develop develop-only test build test clean setup-git update-submodules node-version-check install-system-pkgs install-yarn-pkgs install-clims-dev build-js-po locale update-transifex build-platform-assets test-cli test-js test-styleguide test-python test-snuba test-acceptance lint lint-python lint-js publish middleware middleware-teardown fresh scan-python test-python-integration test-python-unit
