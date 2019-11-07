from __future__ import absolute_import

import pytest
from django.core.urlresolvers import reverse

from sentry.testutils import APITestCase

from tests.fixtures.plugins.gemstones_inc.models import GemstoneSample, GemstoneContainer


class ContainerTest(APITestCase):
    def test_find_single_container_by_container_name(self):
        # TODO: This takes too much time for 10 containers filled with samples
        container = self.create_container_with_samples(
            GemstoneContainer, GemstoneSample, "find_single")
        url = reverse('clims-api-0-containers', args=(self.organization.name,))
        self.login_as(self.user)
        query = 'container.name:' + container.name
        response = self.client.get(url + '?query=' + query)
        assert response.status_code == 200, response.content
        assert len(response.data) == 1, len(response.data)
        assert response.data[0]['name'] == container.name

    @pytest.mark.skip("This is wip")
    def test_can_expand_samples_when_searching(self):
        container = self.create_container_with_samples(
            GemstoneContainer, GemstoneSample, "expand_samples")
        url = reverse('clims-api-0-containers', args=(self.organization.name,))
        self.login_as(self.user)
        query = 'container.name:' + container.name
        response = self.client.get(url + '?query={}&expand=true'.format(query))
        assert response.status_code == 200, response.content
        # print(response.data[0]['content'])
