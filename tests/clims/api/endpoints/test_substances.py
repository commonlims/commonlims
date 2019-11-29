from __future__ import absolute_import

import random
import json

from django.core.urlresolvers import reverse

from sentry.testutils import APITestCase

from rest_framework import status
from clims.models import Substance
from tests.fixtures.plugins.gemstones_inc.models import GemstoneSample


class SubstancesTest(APITestCase):
    def create_gemstone(self, *args, **kwargs):
        return self.create_substance(GemstoneSample, *args, **kwargs)

    def test_search_substances_find_single_by_name(self):
        # NOTE: For now, the search is always using wildcards. This will be ported to using
        # elastic in milestone 2.
        sample = self.create_gemstone(color='red')
        sample.color = 'blue'
        sample.save()

        another = self.create_gemstone()
        another.save()

        search = 'sample.name:' + sample.name

        url = reverse('clims-api-0-substances', args=(sample.organization.name,))
        self.login_as(self.user)
        response = self.client.get(url + '?search=' + search)
        assert response.status_code == 200, response.content
        # The search is for a unique name, so this must be true:
        assert len(response.data) == 1, len(response.data)

    def test_get_substances(self):
        first = self.create_gemstone(color='red')
        first.color = 'blue'
        first.save()

        url = reverse('clims-api-0-substances', args=(first.organization.name,))
        self.login_as(self.user)
        response = self.client.get(url)
        len_before = len(response.data)

        second = self.create_gemstone()
        response = self.client.get(url)

        assert response.status_code == 200, response.content

        assert len(response.data) == len_before + 1
        data_by_id = {int(entry['id']): entry for entry in response.data}

        def asserts(sample, response):
            properties = response.pop('properties')
            if 'color' in properties:
                assert properties['color']['value'] == sample.properties['color'].value
            assert response.pop('name') == sample.name
            assert response.pop('version') == sample.version
            assert response.pop('id') == sample.id
            assert response.pop('type_full_name') == sample.type_full_name
            assert response.pop('location') is None
            assert len(response) == 0

        asserts(first, data_by_id[first.id])
        asserts(second, data_by_id[second.id])

    def test_post_substance(self):
        # Setup
        extensible_type = self.register_extensible(GemstoneSample)

        url = reverse('clims-api-0-substances', args=(extensible_type.plugin.organization.slug,))

        payload = {
            "name": "stuff:{}".format(random.random()),
            "properties": {'color': 'red'},
            "type_full_name": extensible_type.name
        }

        # Test
        self.login_as(self.user)
        response = self.client.post(
            path=url,
            data=json.dumps(payload),
            content_type='application/json',
        )

        # Validate
        assert response.status_code == status.HTTP_201_CREATED, response.data
        created_id = response.data["id"]

        substance = Substance.objects.get(id=created_id)
        assert substance.name == payload['name']
