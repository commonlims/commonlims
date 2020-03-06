# -*- coding: utf-8 -*-


from tests.clims.models.test_substance import SubstanceTestCase
from clims.api.serializers.models.substance import SubstanceSerializer


class SubstanceSerializerTest(SubstanceTestCase):
    def test_simple(self):
        sample = self.create_gemstone(color='red')
        serializer = SubstanceSerializer(sample)
        assert serializer.data['id'] == sample.id
        assert serializer.data['version'] == sample.version
        assert serializer.data['name'] == sample.name
        assert serializer.data['properties']['color']['name'] == 'color'
        assert serializer.data['properties']['color']['value'] == 'red'
        assert serializer.data['type_full_name'] == sample.type_full_name

    def test_substance_deserialize_errors_if_missing_required(self):
        data = {
            'properties': {}
        }

        serializer = SubstanceSerializer(data=data)
        valid = serializer.is_valid()

        assert not valid
        assert serializer.errors['name'] == [u'This field is required.']
        assert serializer.errors['type_full_name'] == [u'This field is required.']
