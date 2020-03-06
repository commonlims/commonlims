

import mock
import os


TEST_ROOT = os.path.normpath(
    os.path.join(
        os.path.dirname(__file__),
        os.pardir,
        os.pardir,
        os.pardir,
        os.pardir,
        'tests'))


def pytest_configure(config):
    if config.option.log_level:
        os.environ['CLIMS_LOG_LEVEL'] = config.option.log_level
    # HACK: Only needed for testing!
    os.environ.setdefault('_SENTRY_SKIP_CONFIGURATION', '1')

    # override docs which are typically synchronized from an upstream server
    # to ensure tests are consistent
    os.environ.setdefault(
        'INTEGRATION_DOC_FOLDER',
        os.path.join(
            TEST_ROOT,
            'fixtures',
            'integration-docs'))
    from sentry.utils import integrationdocs
    integrationdocs.DOC_FOLDER = os.environ['INTEGRATION_DOC_FOLDER']

    for setup, _ in tasks:
        if setup:
            setup()


def pytest_runtest_teardown(item):
    for _, teardown in tasks:
        if teardown:
            teardown()


def celery_setup():
    # force celery registration
    from sentry.celery import app  # NOQA


def celery_teardown():
    from celery.task.control import discard_all
    discard_all()


def django_setup():
    # NOTE: Includes a few items that are not django related, but should be ignored in integration
    # tests.
    from django.conf import settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sentry.conf.server')

    # Configure the test database
    settings.DATABASES['default'].update(
        {
            'ENGINE': 'sentry.db.postgres',
            'PORT': '5433',  # Docker image for the test database is exposed at 5433
            'USER': 'test_clims',
            'NAME': 'clims',  # Django will add the test_ prefix
        }
    )

    settings.TEMPLATE_DEBUG = True

    # Disable static compiling in tests
    settings.STATIC_BUNDLES = {}

    # override a few things with our test specifics
    settings.INSTALLED_APPS = tuple(settings.INSTALLED_APPS) + ('tests', )
    # Need a predictable key for tests that involve checking signatures
    settings.SENTRY_PUBLIC = False

    if not settings.SENTRY_CACHE:
        settings.SENTRY_CACHE = 'sentry.cache.django.DjangoCache'
        settings.SENTRY_CACHE_OPTIONS = {}

    # This speeds up the tests considerably, pbkdf2 is by design, slow.
    settings.PASSWORD_HASHERS = [
        'django.contrib.auth.hashers.MD5PasswordHasher',
    ]

    settings.AUTH_PASSWORD_VALIDATORS = []

    # Replace real sudo middleware with our mock sudo middleware
    # to assert that the user is always in sudo mode
    middleware = list(settings.MIDDLEWARE_CLASSES)
    sudo = middleware.index('sentry.middleware.sudo.SudoMiddleware')
    middleware[sudo] = 'sentry.testutils.middleware.SudoMiddleware'
    settings.MIDDLEWARE_CLASSES = tuple(middleware)

    settings.SENTRY_OPTIONS['cloudflare.secret-key'] = 'cloudflare-secret-key'

    # enable draft features
    settings.SENTRY_OPTIONS['mail.enable-replies'] = True

    settings.SENTRY_ALLOW_ORIGIN = '*'

    settings.SENTRY_TSDB = 'sentry.tsdb.inmemory.InMemoryTSDB'
    settings.SENTRY_TSDB_OPTIONS = {}

    if settings.SENTRY_NEWSLETTER == 'sentry.newsletter.base.Newsletter':
        settings.SENTRY_NEWSLETTER = 'sentry.newsletter.dummy.DummyNewsletter'
        settings.SENTRY_NEWSLETTER_OPTIONS = {}

    settings.BROKER_BACKEND = 'memory'
    settings.BROKER_URL = None
    settings.CELERY_ALWAYS_EAGER = False
    settings.CELERY_EAGER_PROPAGATES_EXCEPTIONS = True

    settings.DEBUG_VIEWS = True

    settings.SENTRY_ENCRYPTION_SCHEMES = ()

    settings.DISABLE_RAVEN = True

    settings.CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        }
    }

    if not hasattr(settings, 'SENTRY_OPTIONS'):
        settings.SENTRY_OPTIONS = {}

    settings.SENTRY_OPTIONS.update(
        {
            'redis.clusters': {
                'default': {
                    'hosts': {
                        0: {
                            'db': 9,
                        },
                    },
                },
            },
            'mail.backend': 'django.core.mail.backends.locmem.EmailBackend',
            'system.url-prefix': 'http://testserver',

            'slack.client-id': 'slack-client-id',
            'slack.client-secret': 'slack-client-secret',
            'slack.verification-token': 'slack-verification-token',

            'github-app.name': 'sentry-test-app',
            'github-app.client-id': 'github-client-id',
            'github-app.client-secret': 'github-client-secret',

            'vsts.client-id': 'vsts-client-id',
            'vsts.client-secret': 'vsts-client-secret',
        }
    )

    # django mail uses socket.getfqdn which doesn't play nice if our
    # networking isn't stable
    patcher = mock.patch('socket.getfqdn', return_value='localhost')
    patcher.start()

    from sentry.runner.initializer import (
        bootstrap_options, configure_structlog, initialize_receivers, fix_south,
        bind_cache_to_option_store, setup_services
    )

    bootstrap_options(settings)
    configure_structlog()
    fix_south(settings)

    import django
    if hasattr(django, 'setup'):
        django.setup()

    bind_cache_to_option_store()

    initialize_receivers()
    setup_services()

    # disable DISALLOWED_IPS
    from sentry import http
    http.DISALLOWED_IPS = set()


def django_teardown():
    from sentry.models import OrganizationOption, ProjectOption, UserOption
    for model in (OrganizationOption, ProjectOption, UserOption):
        model.objects.clear_local_cache()


def tsdb_teardown():
    from sentry import tsdb
    # TODO(dcramer): this only works if this is the correct tsdb backend
    tsdb.flush()


def newsletter_teardown():
    # XXX(dcramer): only works with DummyNewsletter
    from sentry import newsletter
    if hasattr(newsletter.backend, 'clear'):
        newsletter.backend.clear()


def redis_setup():
    from sentry.utils.redis import clusters
    with clusters.get('default').all() as client:
        client.flushdb()


def redis_teardown():
    from sentry.utils.redis import clusters
    with clusters.get('default').all() as client:
        client.flushdb()


unit_tasks = []
integration_tasks = [
    (django_setup, django_teardown),
    (redis_setup, redis_teardown),
    (None, tsdb_teardown),
    (None, newsletter_teardown),
    (celery_setup, celery_teardown),
]

# This env variable means that we assume that the whole stack (redis, postgres etc.) is setup
is_integration = os.environ.get('CLIMS_INTEGRATION_TEST', False) == "1"
tasks = integration_tasks if is_integration else unit_tasks
