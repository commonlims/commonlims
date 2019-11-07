from __future__ import absolute_import

import pytest
from exam import fixture

from sentry.testutils import APITestCase


class OrganizationSearchesListTest(APITestCase):
    endpoint = 'clims-api-0-organization-saved-searches'

    @fixture
    def user(self):
        return self.create_user('test@test.com')

    def test_endpoint_returns_builtins(self):
        # TODO: The extended saved search is still WIP and these tests need to be expanded

        self.login_as(user=self.user)
        response = self.get_valid_response(self.organization.slug)

        actual = sorted([(entry['name'], entry['query']) for entry in response.data])
        assert actual == [
            (u'Assigned To Me', u'is:unresolved assigned:me'),
            (u'My Bookmarks', u'is:unresolved bookmarks:me'),
            (u'New Today', u'is:unresolved age:-24h'),
        ]

    @pytest.mark.skip("TODO: not implemented")
    def test_saved_searches_from_plugins_show_up(self):
        """
        Defining a saved search in a plugin (in the saved_searches module) pops up in the endpoint.
        """
        pass

        # TODO: Saved searches should come from two sources:
        #  * built-in and plugins
        #  * saved searches in the database
        # In the original code saved searches come from the database only
