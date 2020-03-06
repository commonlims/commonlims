# coding: utf-8

from __future__ import absolute_import

from datetime import timedelta
from django.core import mail
from django.core.urlresolvers import reverse
from django.http import HttpRequest
from django.utils import timezone
from exam import fixture

from sentry.models import ProjectKey, LostPasswordHash
from sentry.testutils import TestCase


class ProjectKeyTest(TestCase):
    def test_get_dsn(self):
        key = ProjectKey(project_id=1, public_key='public', secret_key='secret')
        with self.options({'system.url-prefix': 'http://example.com'}):
            self.assertEqual(key.get_dsn(), 'http://public:secret@example.com/1')

    def test_get_dsn_with_ssl(self):
        key = ProjectKey(project_id=1, public_key='public', secret_key='secret')
        with self.options({'system.url-prefix': 'https://example.com'}):
            self.assertEqual(key.get_dsn(), 'https://public:secret@example.com/1')

    def test_get_dsn_with_port(self):
        key = ProjectKey(project_id=1, public_key='public', secret_key='secret')
        with self.options({'system.url-prefix': 'http://example.com:81'}):
            self.assertEqual(key.get_dsn(), 'http://public:secret@example.com:81/1')

    def test_get_dsn_with_public_endpoint_setting(self):
        key = ProjectKey(project_id=1, public_key='public', secret_key='secret')
        with self.settings(SENTRY_PUBLIC_ENDPOINT='http://public_endpoint.com'):
            self.assertEqual(key.get_dsn(public=True), 'http://public@public_endpoint.com/1')

    def test_get_dsn_with_endpoint_setting(self):
        key = ProjectKey(project_id=1, public_key='public', secret_key='secret')
        with self.settings(SENTRY_ENDPOINT='http://endpoint.com'):
            self.assertEqual(key.get_dsn(), 'http://public:secret@endpoint.com/1')

    def test_key_is_created_for_project(self):
        self.create_user('admin@example.com')
        team = self.create_team(name='Test')
        project = self.create_project(name='Test', teams=[team])
        assert project.key_set.exists() is True


class LostPasswordTest(TestCase):
    @fixture
    def password_hash(self):
        return LostPasswordHash.objects.create(
            user=self.user,
        )

    def test_send_recover_mail(self):
        request = HttpRequest()
        request.method = 'GET'
        request.META['REMOTE_ADDR'] = '1.1.1.1'

        with self.options({'system.url-prefix': 'http://testserver'}), self.tasks():
            self.password_hash.send_email(request)

        assert len(mail.outbox) == 1
        msg = mail.outbox[0]
        assert msg.to == [self.user.email]
        assert msg.subject == '[Sentry] Password Recovery'
        url = 'http://testserver' + reverse(
            'sentry-account-recover-confirm',
            args=[self.password_hash.user_id, self.password_hash.hash]
        )
        assert url in msg.body


class GroupIsOverResolveAgeTest(TestCase):
    def test_simple(self):
        group = self.group
        group.last_seen = timezone.now() - timedelta(hours=2)
        group.project.update_option('sentry:resolve_age', 1)  # 1 hour
        assert group.is_over_resolve_age() is True
        group.last_seen = timezone.now()
        assert group.is_over_resolve_age() is False
