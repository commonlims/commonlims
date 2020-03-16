from __future__ import absolute_import

import pytest
from django.core.urlresolvers import reverse

from sentry.testutils import APITestCase
from clims.api.serializers.models.container import ContainerSerializer
from clims.api.serializers.models.container import ContainerExpandedSerializer

from tests.fixtures.plugins.gemstones_inc.models import GemstoneSample, GemstoneContainer


class ContainerTest(APITestCase):
    def setUp(self):
        self.has_context()

    def test_find_single_container_by_container_name(self):
        # TODO: This takes too much time for 10 containers filled with samples
        container = self.create_container_with_samples(
            GemstoneContainer, GemstoneSample, "find_single")
        url = reverse('clims-api-0-containers', args=(self.organization.name,))
        self.login_as(self.user)
        search = 'container.name:' + container.name
        response = self.client.get(url + '?search=' + search)
        assert response.status_code == 200, response.content
        assert len(response.data) == 1, len(response.data)
        assert response.data[0]['name'] == container.name
        serializer = ContainerSerializer(data=response.data[0])
        expanded_serializer = ContainerExpandedSerializer(data=response.data[0])
        assert serializer.is_valid()
        assert expanded_serializer.is_valid() is False

    def test_can_expand_samples_when_searching(self):
        # Arrange
        container = self.create_container_with_samples(
            GemstoneContainer, GemstoneSample, "expand_samples", sample_count=2)
        url = reverse('clims-api-0-containers', args=(self.organization.name,))
        self.login_as(self.user)
        query = 'container.name:' + container.name

        # Act
        response = self.client.get(url + '?query={}&expand=true'.format(query))

        # Assert
        assert response.status_code == 200, response.content
        assert len(response.data) == 1, len(response.data)
        assert len(response.data[0]['contents']) == 2
        sample_name = response.data[0]['contents'][0]['name']
        assert sample_name.startswith('sample-')
        type_full_name = response.data[0]['contents'][0]['type_full_name']
        assert type_full_name == 'tests.fixtures.plugins.gemstones_inc.models.GemstoneSample'
        wells = [d['container_index']['index'] for d in response.data[0]['contents']]
        assert wells == ['A:1', 'B:1']

        serializer = ContainerExpandedSerializer(data=response.data[0])
        assert serializer.is_valid()

    @pytest.mark.dev_edvard
    def test_expanded_search_with_no_query_arguments__the_single_container_is_returned(self):
        # Arrange
        self.create_container_with_samples(
            GemstoneContainer, GemstoneSample, "expand_samples", sample_count=2)
        url = reverse('clims-api-0-containers', args=(self.organization.name,))
        self.login_as(self.user)

        # Act
        response = self.client.get(url + '?expand=true')

        # Assert
        assert response.status_code == 200, response.content
        assert len(response.data) == 1, len(response.data)
        assert len(response.data[0]['contents']) == 2
        sample_name = response.data[0]['contents'][0]['name']
        assert sample_name.startswith('sample-')
        type_full_name = response.data[0]['contents'][0]['type_full_name']
        assert type_full_name == 'tests.fixtures.plugins.gemstones_inc.models.GemstoneSample'
        wells = [d['container_index']['index'] for d in response.data[0]['contents']]
        assert wells == ['A:1', 'B:1']

        serializer = ContainerExpandedSerializer(data=response.data[0])
        assert serializer.is_valid()
