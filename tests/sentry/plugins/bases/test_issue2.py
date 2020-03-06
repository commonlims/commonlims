# -*- coding: utf-8 -*-

from __future__ import absolute_import

import mock

from social_auth.models import UserSocialAuth

from sentry.models import User
from sentry.plugins import IssueTrackingPlugin2
from sentry.testutils import TestCase


class PluginWithFields(IssueTrackingPlugin2):
    slug = 'test-plugin-with-fields'
    conf_key = slug
    issue_fields = frozenset(['id', 'title', 'url'])


class PluginWithoutFields(IssueTrackingPlugin2):
    slug = 'test-plugin-without-fields'
    conf_key = slug
    issue_fields = None


class IssueTrackingPlugin2Test(TestCase):
    def test_issue_label_as_dict(self):
        plugin = PluginWithFields()
        result = plugin.get_issue_label(mock.Mock(), {'id': '1'})
        assert result == '#1'

    def test_issue_label_legacy(self):
        plugin = PluginWithoutFields()
        result = plugin.get_issue_label(mock.Mock(), '1')
        assert result == '#1'

    def test_issue_field_map_with_fields(self):
        plugin = PluginWithFields()
        result = plugin.get_issue_field_map()
        assert result == {
            'id': 'test-plugin-with-fields:issue_id',
            'title': 'test-plugin-with-fields:issue_title',
            'url': 'test-plugin-with-fields:issue_url',
        }

    def test_issue_field_map_without_fields(self):
        plugin = PluginWithoutFields()
        result = plugin.get_issue_field_map()
        assert result == {'id': 'test-plugin-without-fields:tid'}


class GetAuthForUserTest(TestCase):
    def _get_mock_user(self):
        user = mock.Mock(spec=User())
        user.id = 1
        user.is_authenticated.return_value = False
        return user

    def test_requires_auth_provider(self):
        user = self._get_mock_user()
        p = IssueTrackingPlugin2()
        self.assertRaises(AssertionError, p.get_auth_for_user, user)

    def test_returns_none_on_missing_identity(self):
        user = self._get_mock_user()
        p = IssueTrackingPlugin2()
        p.auth_provider = 'test'
        self.assertEqual(p.get_auth_for_user(user), None)

    def test_returns_identity(self):
        user = User.objects.create(username='test', email='test@example.com')
        auth = UserSocialAuth.objects.create(provider='test', user=user)
        p = IssueTrackingPlugin2()
        p.auth_provider = 'test'
        self.assertEqual(p.get_auth_for_user(user), auth)
