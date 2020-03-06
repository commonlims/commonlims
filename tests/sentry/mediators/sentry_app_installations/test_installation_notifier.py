

from mock import patch

from sentry.coreapi import APIUnauthorized
from sentry.mediators import sentry_apps
from sentry.mediators.sentry_app_installations import Creator, InstallationNotifier
from sentry.testutils import TestCase
from sentry.testutils.helpers.faux import faux
from sentry.utils import json


class DictContaining(object):
    def __init__(self, *keys):
        self.keys = keys

    def __eq__(self, other):
        return all([k in list(other.keys()) for k in self.keys])


class TestInstallationNotifier(TestCase):
    def setUp(self):
        super(TestInstallationNotifier, self).setUp()

        self.user = self.create_user(name='foo')
        self.org = self.create_organization(owner=self.user)

        self.sentry_app = sentry_apps.Creator.run(
            name='foo',
            organization=self.org,
            webhook_url='https://example.com',
            scopes=(),
        )

        self.install = Creator.run(
            slug='foo',
            organization=self.org,
            user=self.user,
        )

    @patch('sentry.mediators.sentry_app_installations.installation_notifier.safe_urlopen')
    def test_task_enqueued(self, safe_urlopen):
        InstallationNotifier.run(
            install=self.install,
            user=self.user,
            action='created',
        )

        data = faux(safe_urlopen).kwargs['data']

        assert data == json.dumps({
            'action': 'created',
            'installation': {
                'uuid': self.install.uuid,
            },
            'data': {
                'app': {
                    'uuid': self.sentry_app.uuid,
                    'slug': self.sentry_app.slug,
                },
                'organization': {
                    'slug': self.org.slug,
                },
                'uuid': self.install.uuid,
                'code': self.install.api_grant.code,
            },
            'actor': {
                'id': self.user.id,
                'name': self.user.name,
                'type': 'user',
            },
        })

        assert faux(safe_urlopen).kwarg_equals('headers', DictContaining(
            'Content-Type',
            'Request-ID',
            'Sentry-Hook-Resource',
            'Sentry-Hook-Timestamp',
            'Sentry-Hook-Signature',
        ))

    @patch('sentry.mediators.sentry_app_installations.installation_notifier.safe_urlopen')
    def test_uninstallation_enqueued(self, safe_urlopen):
        InstallationNotifier.run(
            install=self.install,
            user=self.user,
            action='deleted',
        )

        data = faux(safe_urlopen).kwargs['data']

        assert data == json.dumps({
            'action': 'deleted',
            'installation': {
                'uuid': self.install.uuid,
            },
            'data': {
                'app': {
                    'uuid': self.sentry_app.uuid,
                    'slug': self.sentry_app.slug,
                },
                'organization': {
                    'slug': self.org.slug,
                },
                'uuid': self.install.uuid,
                'code': self.install.api_grant.code,
            },
            'actor': {
                'id': self.user.id,
                'name': self.user.name,
                'type': 'user',
            },
        })

        assert faux(safe_urlopen).kwarg_equals('headers', DictContaining(
            'Content-Type',
            'Request-ID',
            'Sentry-Hook-Resource',
            'Sentry-Hook-Timestamp',
            'Sentry-Hook-Signature',
        ))

    @patch('sentry.mediators.sentry_app_installations.installation_notifier.safe_urlopen')
    def test_invalid_installation_action(self, safe_urlopen):
        with self.assertRaises(APIUnauthorized):
            InstallationNotifier.run(
                install=self.install,
                user=self.user,
                action='updated',
            )

        assert not safe_urlopen.called
