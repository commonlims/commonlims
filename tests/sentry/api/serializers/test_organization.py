# -*- coding: utf-8 -*-


import six

from sentry.api.serializers import serialize
from sentry.testutils import TestCase


class OrganizationSerializerTest(TestCase):
    def test_simple(self):
        user = self.create_user()
        organization = self.create_organization(owner=user)

        result = serialize(organization, user)
        assert result['id'] == six.text_type(organization.id)
