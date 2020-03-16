from __future__ import absolute_import

from django.core.urlresolvers import reverse

from sentry.testutils import APITestCase

from tests.fixtures.plugins.gemstones_inc.models import GemstoneProject


class ProjectPropertyEndpointTest(APITestCase):
    def setUp(self):
        self.has_context()

    def test_find_all_substance_property(self):

        project = self.create_clims_project(GemstoneProject, continent='Eurasia')
        project.save()

        project = self.create_clims_project(GemstoneProject, continent='Africa')
        project.save()

        project = self.create_clims_project(GemstoneProject, continent='Africa')
        project.save()

        url = reverse('clims-api-0-project-property',
                      kwargs={'organization_slug': project.organization.name, 'prop': 'continent'})
        self.login_as(self.user)
        response = self.client.get(url)
        assert response.status_code == 200, response.content

        assert response.data == ['Eurasia', 'Africa', 'Africa']

    def test_find_unique_substance_property(self):
        project = self.create_clims_project(GemstoneProject, continent='Eurasia')
        project.save()

        project = self.create_clims_project(GemstoneProject, continent='Africa')
        project.save()

        project = self.create_clims_project(GemstoneProject, continent='Africa')
        project.save()

        url = reverse('clims-api-0-project-property',
                      kwargs={'organization_slug': project.organization.name, 'prop': 'continent'})
        self.login_as(self.user)
        response = self.client.get(url, {'unique': True})
        assert response.status_code == 200, response.content
        assert set(response.data) == set(['Eurasia', 'Africa'])
