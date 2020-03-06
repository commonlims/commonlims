

import pytest
from sentry.testutils import TestCase
from clims.services.project import ProjectBase
from clims.services.substance import SubstanceBase
from clims.services import FloatField, TextField, IntField
from django.db import IntegrityError


class TestProject(TestCase):

    def setUp(self):
        self.register_extensible(VampireFangStudyProject)
        self.register_extensible(VampireFangSample)

    def test_can_create_project(self):
        project = VampireFangStudyProject(name="project1", organization=self.organization)
        project.save()
        self.app.projects.get(name=project.name)  # Raises DoesNotExist if it wasn't created

    def test_name_is_unique(self):
        project = VampireFangStudyProject(name="project1", organization=self.organization)
        project.save()
        project2 = VampireFangStudyProject(name=project.name, organization=self.organization)
        with pytest.raises(IntegrityError):
            project2.save()

    def test_can_add_custom_property(self):
        project = VampireFangStudyProject(name="project1", organization=self.organization)
        project.comment = "test"
        project.save()

        project_fetched_again = self.app.projects.get(id=project.id)
        assert project.comment == project_fetched_again.comment

    def test_can_add_sample(self):
        project = VampireFangStudyProject(name="project1", organization=self.organization)
        project.save()
        sample = VampireFangSample(name="sample1", organization=self.organization, project=project)
        sample.pointiness = 10.0
        sample.save()
        assert sample.project.name == project.name

    def test_project_type(self):
        project = VampireFangStudyProject(name="project1", organization=self.organization)
        project.save()
        sample = VampireFangSample(name="sample1", organization=self.organization, project=project)
        sample.pointiness = 10.0
        sample.save()
        assert isinstance(sample.project, VampireFangStudyProject)

    @pytest.mark.skip('not implemented')
    def test_save_two_samples__with_same_names_but_different_projects__ok(self):
        project1 = VampireFangStudyProject(name="project1", organization=self.organization)
        project1.save()
        sample1 = VampireFangSample(name="sample1", organization=self.organization, project=project1)
        sample1.pointiness = 10.0
        sample1.save()

        project2 = VampireFangStudyProject(name="project2", organization=self.organization)
        project2.save()
        sample1b = VampireFangSample(name="sample1", organization=self.organization, project=project2)
        sample1b.pointiness = 10.0
        sample1b.save()

    def test_sample_is_not_initalized_with_project__project_on_sample_is_none(self):
        sample1 = VampireFangSample(name="sample1", organization=self.organization)
        sample1.pointiness = 10.0
        sample1.save()
        assert sample1.project is None

    def test_create_and_save_sample__with_project_set__fetched_sample_from_db_has_project(self):
        project = VampireFangStudyProject(name="project1", organization=self.organization)
        project.save()
        sample = VampireFangSample(name="sample1", organization=self.organization, project=project)
        sample.pointiness = 10.0
        sample.save()
        fetched_sample = self.app.substances.get(name='sample1')
        assert isinstance(fetched_sample.project, VampireFangStudyProject)
        assert fetched_sample.project.name == project.name


class VampireFangStudyProject(ProjectBase):
    species = TextField("species")
    country_of_sampling = TextField("country_of_sampling")
    pi = TextField("pi")
    number_of_vampires_to_sample = IntField("number_of_vampires_to_sample")
    # TODO I guess maybe in the long run we need something smarter for comments in general
    #      in the long run they need to be sorted, associated with users, etc... /JD 2019-10-23
    comment = TextField("comment")


class VampireFangSample(SubstanceBase):
    pointiness = FloatField("pointiness")
