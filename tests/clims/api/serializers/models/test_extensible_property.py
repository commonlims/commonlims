
from __future__ import absolute_import

from sentry.testutils import TestCase

from clims.api.serializers.models.extensible_property import ExtensiblePropertySerializer
from clims.models.extensible import ExtensibleProperty, ExtensiblePropertyType, ExtensibleType
from clims.models.plugin_registration import PluginRegistration


class ExtensiblePropertyTypeSerializerTestCase(TestCase):

    def setUp(self):
        example_plugin, _ = PluginRegistration.objects.get_or_create(
            name='clims.example.plugin', version='1.0.0')
        self.extensible_type = ExtensibleType(name="test type", plugin=example_plugin)

    def create_prop(self, prop_name, disp_name, prop_type, value):
        extensible_property_type = ExtensiblePropertyType(name=prop_name,
                                                          display_name=disp_name,
                                                          extensible_type=self.extensible_type,
                                                          raw_type=prop_type)
        extensible_property = ExtensibleProperty(extensible_property_type=extensible_property_type,
                                                 string_value=value)
        return extensible_property

    def create_string_prop(self, prop_name, disp_name, value):
        return self.create_prop(prop_name, disp_name, 's', value)

    def test_can_serialize_extensible_property_simple_string_prop(self):
        name = "stringprop"
        disp_name = "My String Prop"
        value = "my string value"
        string_prop = self.create_string_prop(name, disp_name, value)
        serializer = ExtensiblePropertySerializer(string_prop)
        assert serializer.data['name'] == name
        assert serializer.data['value'] == value

    def test_can_serialize_extensible_property_simple_int_prop(self):
        name = "intprop"
        disp_name = "My Int Prop"
        value = 1
        string_prop = self.create_string_prop(name, disp_name, value)
        serializer = ExtensiblePropertySerializer(string_prop)
        assert serializer.data['name'] == name
        assert serializer.data['value'] == str(value)
