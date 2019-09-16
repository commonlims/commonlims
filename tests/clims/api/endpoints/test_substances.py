from __future__ import absolute_import

import random
import json

from django.core.urlresolvers import reverse

from sentry.testutils import APITestCase

from tests.clims import testutils
from rest_framework import status
from clims.models import Substance


class SubstancesTest(APITestCase):
    def test_get_substances(self):
        substance = testutils.create_substance()

        url = reverse('clims-api-0-substances', args=(substance.organization.name,))
        self.login_as(self.user)

        url = reverse('clims-api-0-substances', args=("lab",))
        response = self.client.get(url)
        len_before = len(response.data)

        substance = testutils.create_substance()
        response = self.client.get(url)

        assert response.status_code == 200, response.content
        assert len(response.data) == len_before + 1

    def test_post_substance(self):
        # Setup
        org = testutils.create_organization()
        substance_type = testutils.create_substance_type()
        url = reverse('clims-api-0-substances', args=(org.name,))
        name = "stuff:{}".format(random.random())
        payload = json.dumps({
            "name": name,
            "properties": {'color': 'red'},
            "extensible_type": "GemstoneSample"
        })

        # Test
        self.login_as(self.user)
        response = self.client.post(
            path=url,
            data=payload,
            content_type='application/json',
        )

        # Validate
        assert response.status_code == status.HTTP_201_CREATED, response.data

        substance = Substance.objects.get(id=response.data['id'])
        assert substance.name == name
        assert substance.extensible_type.full_name == substance_type.full_name
