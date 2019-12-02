from __future__ import absolute_import

import random
import json

from django.core.urlresolvers import reverse
from clims.models.project import Project


from sentry.testutils import APITestCase

from rest_framework import status
from tests.fixtures.plugins.gemstones_inc.models import GemstoneProject


class ProjectTest(APITestCase):
    def create_gemstone(self, *args, **kwargs):
        return self.create_Project(GemstoneProject, *args, **kwargs)

    def test_search_project_find_single_by_name(self):
        # NOTE: For now, the search is always using wildcards. This will be ported to using
        # elastic in milestone 2.
        project = self.create_clims_project(GemstoneProject, continent='Eurasia')
        project.save()

        another = self.create_clims_project(GemstoneProject)
        another.save()

        search = 'project.name:' + project.name

        url = reverse('clims-api-0-projects', args=(project.organization.name,))
        self.login_as(self.user)
        response = self.client.get(url + '?search=' + search)
        assert response.status_code == 200, response.content
        # The search is for a unique name, so this must be true:
        assert len(response.data) == 1, len(response.data)

    def test_get_project(self):
        first = self.create_clims_project(GemstoneProject, continent='Eurasia')
        first.save()

        url = reverse('clims-api-0-projects', args=(first.organization.name,))
        self.login_as(self.user)
        response = self.client.get(url)
        len_before = len(response.data)

        second = self.create_clims_project(GemstoneProject)
        response = self.client.get(url)

        assert response.status_code == 200, response.content

        assert len(response.data) == len_before + 1
        data_by_id = {int(entry['id']): entry for entry in response.data}

        def asserts(project, response):
            properties = response.pop('properties')
            if 'color' in properties:
                assert properties['continent']['value'] == project.properties['continent'].value
            assert response.pop('name') == project.name
            assert response.pop('version') == project.version
            assert response.pop('id') == project.id
            assert response.pop('type_full_name') == project.type_full_name
            assert len(response) == 0

        asserts(first, data_by_id[first.id])
        asserts(second, data_by_id[second.id])

    def test_post_substance(self):
        # Setup
        extensible_type = self.register_extensible(GemstoneProject)

        url = reverse('clims-api-0-projects', args=(extensible_type.plugin.organization.slug,))

        payload = {
            "name": "stuff:{}".format(random.random()),
            "properties": {'continent': 'Africa'},
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

        substance = Project.objects.get(id=created_id)
        assert substance.name == payload['name']
