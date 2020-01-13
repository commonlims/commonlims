
from __future__ import absolute_import
from sentry.testutils import TestCase
from clims.services.project import ProjectBase
from clims.services.extensible import TextField
import random


class TestProjectService(TestCase):

    def setUp(self):
        self.register_extensible(GemstoneProject)

    def create_a_bunch_of_projects(self):
        country_choices = ['Sweden', 'Norway', 'Denmark', 'Finland', 'Flat Iceland']
        country_list = []
        for i in range(0, 100):
            pick = random.choice(country_choices)
            project = GemstoneProject(name='project{}'.format(i),
                                      organization=self.organization,
                                      country_of_sampling=pick)
            project.save()
            country_list.append(pick)
        return country_list

    def test_get_unique_values_of_property(self):
        country_choices = set(self.create_a_bunch_of_projects())
        actual = self.app.projects.get_unique_values_of_property(property='country_of_sampling',
                                                                 extensible_type=GemstoneProject)
        assert actual == country_choices

    def test_get_values_of_property(self):
        country_choices = self.create_a_bunch_of_projects()
        actual = self.app.projects.get_values_of_property(property='country_of_sampling',
                                                          extensible_type=GemstoneProject)
        assert sorted(actual) == sorted(country_choices)


class GemstoneProject(ProjectBase):
    species = TextField("species")
    country_of_sampling = TextField("country_of_sampling")
