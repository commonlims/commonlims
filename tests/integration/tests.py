# -*- coding: utf-8 -*-

from __future__ import absolute_import, print_function

import pytest
import os
import datetime
import json
import mock
import zlib

from sentry import tagstore
from django.conf import settings
from django.core.urlresolvers import reverse
from django.test.utils import override_settings
from django.utils import timezone
from exam import fixture
from gzip import GzipFile
from six import StringIO

from sentry.models import (Event)
from sentry.testutils import TestCase
from sentry.testutils.helpers import get_auth_header
from sentry.utils.settings import (validate_settings, ConfigurationError, import_string)

# TODO: The tests skipped in this file have to do with different ways of connecting to sentry.
# Evaluate which of these should be ported to CLIMS (if any). Since clims does very calls
# to the endpoint, using the same authentication scheme always we might not need these tests.
# Sentry is doing calls to their store endpoint which handles different auth schemes.

DEPENDENCY_TEST_DATA = {
    "postgresql": (
        'DATABASES', 'psycopg2.extensions', "database engine",
        "django.db.backends.postgresql_psycopg2", {
            'default': {
                'ENGINE': "django.db.backends.postgresql_psycopg2",
                'NAME': 'test',
                'USER': 'root',
                'PASSWORD': '',
                'HOST': 'localhost',
                'PORT': ''
            }
        }
    ),
    "mysql": (
        'DATABASES', 'MySQLdb', "database engine", "django.db.backends.mysql", {
            'default': {
                'ENGINE': "django.db.backends.mysql",
                'NAME': 'test',
                'USER': 'root',
                'PASSWORD': '',
                'HOST': 'localhost',
                'PORT': ''
            }
        }
    ),
    "oracle": (
        'DATABASES', 'cx_Oracle', "database engine", "django.db.backends.oracle", {
            'default': {
                'ENGINE': "django.db.backends.oracle",
                'NAME': 'test',
                'USER': 'root',
                'PASSWORD': '',
                'HOST': 'localhost',
                'PORT': ''
            }
        }
    ),
    "memcache": (
        'CACHES', 'memcache', "caching backend",
        "django.core.cache.backends.memcached.MemcachedCache", {
            'default': {
                'BACKEND': "django.core.cache.backends.memcached.MemcachedCache",
                'LOCATION': '127.0.0.1:11211',
            }
        }
    ),
    "pylibmc": (
        'CACHES', 'pylibmc', "caching backend", "django.core.cache.backends.memcached.PyLibMCCache",
        {
            'default': {
                'BACKEND': "django.core.cache.backends.memcached.PyLibMCCache",
                'LOCATION': '127.0.0.1:11211',
            }
        }
    ),
}


def get_fixture_path(name):
    return os.path.join(os.path.dirname(__file__), 'fixtures', name)


def load_fixture(name):
    with open(get_fixture_path(name)) as fp:
        return fp.read()


class SentryRemoteTest(TestCase):
    @fixture
    def path(self):
        return reverse('sentry-api-store')

    @pytest.mark.skip("Evaluate if needed")
    def test_minimal(self):
        kwargs = {'message': 'hello', 'tags': {'foo': 'bar'}}

        resp = self._postWithHeader(kwargs)

        assert resp.status_code == 200, resp.content

        event_id = json.loads(resp.content)['id']
        instance = Event.objects.get(event_id=event_id)

        assert instance.message == 'hello'

        assert tagstore.get_tag_key(self.project.id, None, 'foo') is not None
        assert tagstore.get_tag_value(self.project.id, None, 'foo', 'bar') is not None
        assert tagstore.get_group_tag_key(
            self.project.id, instance.group_id, None, 'foo') is not None
        assert tagstore.get_group_tag_value(
            instance.project_id,
            instance.group_id,
            None,
            'foo',
            'bar') is not None

    @pytest.mark.skip("Evaluate if needed")
    def test_timestamp(self):
        timestamp = timezone.now().replace(
            microsecond=0, tzinfo=timezone.utc
        ) - datetime.timedelta(hours=1)
        kwargs = {u'message': 'hello', 'timestamp': float(timestamp.strftime('%s.%f'))}
        resp = self._postWithSignature(kwargs)
        assert resp.status_code == 200, resp.content
        instance = Event.objects.get()
        assert instance.message == 'hello'
        assert instance.datetime == timestamp
        group = instance.group
        assert group.first_seen == timestamp
        assert group.last_seen == timestamp

    @pytest.mark.skip("Evaluate if needed")
    def test_timestamp_as_iso(self):
        timestamp = timezone.now().replace(
            microsecond=0, tzinfo=timezone.utc
        ) - datetime.timedelta(hours=1)
        kwargs = {u'message': 'hello', 'timestamp': timestamp.strftime('%Y-%m-%dT%H:%M:%S.%f')}
        resp = self._postWithSignature(kwargs)
        assert resp.status_code == 200, resp.content
        instance = Event.objects.get()
        assert instance.message == 'hello'
        assert instance.datetime == timestamp
        group = instance.group
        assert group.first_seen == timestamp
        assert group.last_seen == timestamp

    @pytest.mark.skip("Evaluate if needed")
    def test_ungzipped_data(self):
        kwargs = {'message': 'hello'}
        resp = self._postWithSignature(kwargs)
        assert resp.status_code == 200
        instance = Event.objects.get()
        assert instance.message == 'hello'

    @pytest.mark.skip("Evaluate if needed")
    @override_settings(SENTRY_ALLOW_ORIGIN='sentry.io')
    def test_correct_data_with_get(self):
        kwargs = {'message': 'hello'}
        resp = self._getWithReferer(kwargs)
        assert resp.status_code == 200, resp.content
        instance = Event.objects.get()
        assert instance.message == 'hello'

    @pytest.mark.skip("Evaluate if needed")
    @override_settings(SENTRY_ALLOW_ORIGIN='*')
    def test_get_without_referer_allowed(self):
        self.project.update_option('sentry:origins', '')
        kwargs = {'message': 'hello'}
        resp = self._getWithReferer(kwargs, referer=None, protocol='4')
        assert resp.status_code == 200, resp.content

    @pytest.mark.skip("Evaluate if needed")
    @override_settings(SENTRY_ALLOW_ORIGIN='sentry.io')
    def test_correct_data_with_post_referer(self):
        kwargs = {'message': 'hello'}
        resp = self._postWithReferer(kwargs)
        assert resp.status_code == 200, resp.content
        instance = Event.objects.get()
        assert instance.message == 'hello'

    @pytest.mark.skip("Evaluate if needed")
    @override_settings(SENTRY_ALLOW_ORIGIN='sentry.io')
    def test_post_without_referer(self):
        self.project.update_option('sentry:origins', '')
        kwargs = {'message': 'hello'}
        resp = self._postWithReferer(kwargs, referer=None, protocol='4')
        assert resp.status_code == 200, resp.content

    @pytest.mark.skip("Evaluate if needed")
    @override_settings(SENTRY_ALLOW_ORIGIN='*')
    def test_post_without_referer_allowed(self):
        self.project.update_option('sentry:origins', '')
        kwargs = {'message': 'hello'}
        resp = self._postWithReferer(kwargs, referer=None, protocol='4')
        assert resp.status_code == 200, resp.content

    @override_settings(SENTRY_ALLOW_ORIGIN='google.com')
    def test_post_with_invalid_origin(self):
        self.project.update_option('sentry:origins', 'sentry.io')
        kwargs = {'message': 'hello'}
        resp = self._postWithReferer(
            kwargs,
            referer='https://getsentry.net',
            protocol='4'
        )
        assert resp.status_code == 403, resp.content

    @pytest.mark.skip("Evaluate if needed")
    def test_content_encoding_deflate(self):
        kwargs = {'message': 'hello'}

        message = zlib.compress(json.dumps(kwargs))

        key = self.projectkey.public_key
        secret = self.projectkey.secret_key

        with self.tasks():
            resp = self.client.post(
                self.path,
                message,
                content_type='application/octet-stream',
                HTTP_CONTENT_ENCODING='deflate',
                HTTP_X_SENTRY_AUTH=get_auth_header('_postWithHeader', key, secret),
            )

        assert resp.status_code == 200, resp.content

        event_id = json.loads(resp.content)['id']
        instance = Event.objects.get(event_id=event_id)

        assert instance.message == 'hello'

    @pytest.mark.skip("Evaluate if needed")
    def test_content_encoding_gzip(self):
        kwargs = {'message': 'hello'}

        message = json.dumps(kwargs)

        fp = StringIO()

        try:
            f = GzipFile(fileobj=fp, mode='w')
            f.write(message)
        finally:
            f.close()

        key = self.projectkey.public_key
        secret = self.projectkey.secret_key

        with self.tasks():
            resp = self.client.post(
                self.path,
                fp.getvalue(),
                content_type='application/octet-stream',
                HTTP_CONTENT_ENCODING='gzip',
                HTTP_X_SENTRY_AUTH=get_auth_header('_postWithHeader', key, secret),
            )

        assert resp.status_code == 200, resp.content

        event_id = json.loads(resp.content)['id']
        instance = Event.objects.get(event_id=event_id)

        assert instance.message == 'hello'

    @pytest.mark.skip("Evaluate if needed")
    def test_protocol_v2_0_without_secret_key(self):
        kwargs = {'message': 'hello'}

        resp = self._postWithHeader(
            data=kwargs,
            key=self.projectkey.public_key,
            protocol='2.0',
        )

        assert resp.status_code == 200, resp.content

        event_id = json.loads(resp.content)['id']
        instance = Event.objects.get(event_id=event_id)

        assert instance.message == 'hello'

    @pytest.mark.skip("Evaluate if needed")
    def test_protocol_v3(self):
        kwargs = {'message': 'hello'}

        resp = self._postWithHeader(
            data=kwargs,
            key=self.projectkey.public_key,
            secret=self.projectkey.secret_key,
            protocol='3',
        )

        assert resp.status_code == 200, resp.content

        event_id = json.loads(resp.content)['id']
        instance = Event.objects.get(event_id=event_id)

        assert instance.message == 'hello'

    @pytest.mark.skip("Evaluate if needed")
    def test_protocol_v4(self):
        kwargs = {'message': 'hello'}

        resp = self._postWithHeader(
            data=kwargs,
            key=self.projectkey.public_key,
            secret=self.projectkey.secret_key,
            protocol='4',
        )

        assert resp.status_code == 200, resp.content

        event_id = json.loads(resp.content)['id']
        instance = Event.objects.get(event_id=event_id)

        assert instance.message == 'hello'

    @pytest.mark.skip("Evaluate if needed")
    def test_protocol_v5(self):
        kwargs = {'message': 'hello'}

        resp = self._postWithHeader(
            data=kwargs,
            key=self.projectkey.public_key,
            secret=self.projectkey.secret_key,
            protocol='5',
        )

        assert resp.status_code == 200, resp.content

        event_id = json.loads(resp.content)['id']
        instance = Event.objects.get(event_id=event_id)

        assert instance.message == 'hello'

    @pytest.mark.skip("Evaluate if needed")
    def test_protocol_v6(self):
        kwargs = {'message': 'hello'}

        resp = self._postWithHeader(
            data=kwargs,
            key=self.projectkey.public_key,
            secret=self.projectkey.secret_key,
            protocol='6',
        )

        assert resp.status_code == 200, resp.content

        event_id = json.loads(resp.content)['id']
        instance = Event.objects.get(event_id=event_id)

        assert instance.message == 'hello'


class DepdendencyTest(TestCase):
    def raise_import_error(self, package):
        def callable(package_name):
            if package_name != package:
                return import_string(package_name)
            raise ImportError("No module named %s" % (package, ))

        return callable

    @mock.patch('django.conf.settings', mock.Mock())
    @mock.patch('sentry.utils.settings.import_string')
    def validate_dependency(
        self, key, package, dependency_type, dependency, setting_value, import_string
    ):

        import_string.side_effect = self.raise_import_error(package)

        with self.settings(**{key: setting_value}):
            with self.assertRaises(ConfigurationError):
                validate_settings(settings)

    def test_validate_fails_on_postgres(self):
        self.validate_dependency(*DEPENDENCY_TEST_DATA['postgresql'])

    def test_validate_fails_on_mysql(self):
        self.validate_dependency(*DEPENDENCY_TEST_DATA['mysql'])

    def test_validate_fails_on_oracle(self):
        self.validate_dependency(*DEPENDENCY_TEST_DATA['oracle'])

    def test_validate_fails_on_memcache(self):
        self.validate_dependency(*DEPENDENCY_TEST_DATA['memcache'])

    def test_validate_fails_on_pylibmc(self):
        self.validate_dependency(*DEPENDENCY_TEST_DATA['pylibmc'])


def get_fixtures(name):
    path = os.path.join(os.path.dirname(__file__), 'fixtures/csp', name)
    try:
        with open(path + '_input.json', 'rb') as fp1:
            input = fp1.read()
    except IOError:
        input = None

    try:
        with open(path + '_output.json', 'rb') as fp2:
            output = json.load(fp2)
    except IOError:
        output = None

    return input, output
