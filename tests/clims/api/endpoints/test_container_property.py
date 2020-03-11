from __future__ import absolute_import

from django.core.urlresolvers import reverse

from sentry.testutils import APITestCase
from tests.fixtures.plugins.gemstones_inc.models import GemstoneContainer


class ContainerPropertyEndpointTest(APITestCase):
    def setUp(self):
        self.has_context()

    def test_find_all_container_property(self):
        container = self.create_container(color='blue', klass=GemstoneContainer)
        container.save()

        container = self.create_container(color='red', klass=GemstoneContainer)
        container.save()

        container = self.create_container(color='red', klass=GemstoneContainer)
        container.save()

        container = self.create_container(color='teal', klass=GemstoneContainer)
        container.save()

        url = reverse('clims-api-0-container-property',
                      kwargs={'organization_slug': self.organization.name, 'prop': 'color'})
        self.login_as(self.user)
        response = self.client.get(url)
        assert response.status_code == 200, response.content

        assert response.data == ['blue', 'red', 'red', 'teal']

    def test_find_unique_container_property(self):
        container = self.create_container(color='blue', klass=GemstoneContainer)
        container.save()

        container = self.create_container(color='red', klass=GemstoneContainer)
        container.save()

        container = self.create_container(color='red', klass=GemstoneContainer)
        container.save()

        container = self.create_container(color='teal', klass=GemstoneContainer)
        container.save()
        url = reverse('clims-api-0-container-property',
                      kwargs={'organization_slug': self.organization.name, 'prop': 'color'})
        self.login_as(self.user)
        response = self.client.get(url, {'unique': True})
        assert response.status_code == 200, response.content
        assert set(response.data) == set(['blue', 'red', 'teal'])
