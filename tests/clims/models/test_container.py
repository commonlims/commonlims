from __future__ import absolute_import

import pytest
from sentry.testutils import TestCase
from clims.services import ContainerBase, SubstanceBase
from clims.services import FloatField, TextField
from clims.models import Container
from django.db import IntegrityError


class TestContainer(TestCase):
    def test_can_register_container(self):
        self.register_extensible(HairSampleContainer)

    def test_can_create_container(self):
        self.register_extensible(HairSampleContainer)
        container = HairSampleContainer(name="container1", organization=self.organization)
        container.save()
        Container.objects.get(name=container.name)  # Raises DoesNotExist if it wasn't created

    def test_name_is_unique(self):
        self.register_extensible(HairSampleContainer)
        container = HairSampleContainer(name="container1", organization=self.organization)
        container.save()
        container2 = HairSampleContainer(name=container.name, organization=self.organization)
        with pytest.raises(IntegrityError):
            container2.save()

    def test_can_add_custom_property(self):
        self.register_extensible(HairSampleContainer)
        container = HairSampleContainer(name="container1", organization=self.organization)
        container.comment = "test"
        container.save()

        model = Container.objects.get(id=container.id)
        container_fetched_again = self.app.containers.to_wrapper(model)
        assert container.comment == container_fetched_again.comment

    def test_can_add_sample(self):
        self.register_extensible(HairSampleContainer)
        self.register_extensible(HairSample)
        sample = HairSample(name="sample1", organization=self.organization)
        sample.length = 10
        sample.width = 20
        sample.save()


class HairSampleContainer(ContainerBase):
    rows = 10
    columns = 20
    levels = 1  # Not necessary, this is the default

    comment = TextField("comment")


class HairSample(SubstanceBase):
    length = FloatField("length")
    width = FloatField("width")
