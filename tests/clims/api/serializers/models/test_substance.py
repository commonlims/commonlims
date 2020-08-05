# -*- coding: utf-8 -*-

from __future__ import absolute_import

from tests.clims.models.test_substance import SubstanceTestCase
from clims.api.serializers.models.substance import SubstanceSerializer
from tests.fixtures.plugins.gemstones_inc.models import GemstoneSample, GemstoneContainer


class SubstanceSerializerTest(SubstanceTestCase):
    def setUp(self):
        # TODO: It would be better if the serializer tests wouldn't require a context
        self.has_context()
        self.register_extensible(GemstoneContainer)
        self.register_extensible(GemstoneSample)

    def test_simple(self):
        sample = self.create_gemstone(color='red')
        serializer = SubstanceSerializer(sample)
        assert serializer.data['id'] == sample.id
        assert serializer.data['version'] == sample.version
        assert serializer.data['name'] == sample.name
        assert serializer.data['properties']['color']['name'] == 'color'
        assert serializer.data['properties']['color']['value'] == 'red'
        assert serializer.data['type_full_name'] == sample.type_full_name
        assert serializer.data['location'] is None

    def test_substance_deserialize_errors_if_missing_required(self):
        data = {
            'properties': {}
        }

        serializer = SubstanceSerializer(data=data)
        valid = serializer.is_valid()

        assert not valid
        assert serializer.errors['name'] == [u'This field is required.']
        assert serializer.errors['type_full_name'] == [u'This field is required.']

    def test_substance_in_container_has_location(self):
        container = GemstoneContainer(name="container1")
        sample = container.add("a1", name="something", color="red")
        container.save()

        serializer = SubstanceSerializer(sample)
        assert serializer.data['id'] == sample.id
        assert serializer.data['location'] == {'container': {'name': 'container1'}, 'index': 'A:1'}
