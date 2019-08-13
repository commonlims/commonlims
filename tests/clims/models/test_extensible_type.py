from __future__ import absolute_import


from django.test import TestCase
from clims.models import PluginRegistration, ExtensibleType, Property, Item
from sentry.models import Project


class TestExtensibleType(TestCase):
    def setUp(self):
        # Simulate a plugin registration via pypi

        # TODO: add this to the test base class
        self.plugin_registration = PluginRegistration.objects.create(
            name='clims_plugin', version='1.0.0', url=None)
        self.project = Project.objects.all()[0]

        self.sample_type = ExtensibleType.objects.create(
            name='sample', plugin_registration=self.plugin_registration)

        # Associate a few properties with it
        Property.objects.create(
            name='name',
            type=Property.STRING,
            bound_to=self.sample_type,
            display_name="Name")
        Property.objects.create(
            name='volume',
            type=Property.FLOAT,
            bound_to=self.sample_type,
            display_name="Volume")

    def test_can_create_item_of_type(self):
        # Create an item of type self.sample_type (i.e. the sample created by clims_plugin). It has no properties yet,
        # not even a name.
        Item.objects.create(type=self.sample_type, project=self.project)

    def test_can_set_values(self):
        Item.objects.create(type=self.sample_type, project=self.project)

    def test_can_set_property_with_same_name(self):
        # There is nothing preventing plugins to override names of types defined by other plugins. Here
        # we create a new property also with the name "volume", but bound to custom sample type:
        pr = PluginRegistration.objects.create(
            name='clims_some_other_plugin', version='1.0.0', url=None)
        new_sample_type = ExtensibleType.objects.create(name='sample', plugin_registration=pr)
        Property.objects.create(
            name='volume',
            type=Property.FLOAT,
            bound_to=new_sample_type,
            display_name="Volume")


# TODO NOMERGE: MOVE ALL OF WHAT FOLLOWS

# class SampleDefinedInCorePlugin():
#     volume = FloatProperty()

# class SampleDefinedInCustomPlugin(SampleDefinedInCorePlugin):  # Some custom plugin
#     awesomeness_factor = FloatProperty()
