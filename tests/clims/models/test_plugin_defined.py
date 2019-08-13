from __future__ import absolute_import


import logging
from django.test import TestCase
from clims.models import PluginRegistration, ExtensibleType, PropertyType, ExtensibleInstance
from django.db import transaction
from django.db import models


logger = logging.getLogger(__name__)


class TestPluginDefined(TestCase):
    def setUp(self):
        self.core_plugin = PluginRegistration.objects.create(
            name='clims_plugin_integration_tests', version='1.0.0', url=None)

    def test_can_use_core_sample_model(self):
        registry = ExtensibleTypeRegistry()
        registry.register(SpaceshipDefinedInCorePlugin, self.core_plugin)


# NOMERGE: Move to clims
class ExtensibleTypeRegistry(object):
    """
    Takes care of registering extensible types, from all plugins currently found.

    TODO: Implement the search for ExtensibleTypes
    """

    def register(self, extensible_type_cls, plugin_registration):
        """
        Registers an extensible type class found in a plugin
        """
        import inspect
        name = extensible_type_cls.__name__

        with transaction.atomic():
            extensible_type, _ = ExtensibleType.objects.get_or_create(
                name=name, plugin_registration=plugin_registration)
            # Now, for each attribute of type ExtensibleTypeProperty, register a property:
            for name, obj in inspect.getmembers(
                    extensible_type_cls, lambda x: isinstance(x, ExtensibleTypeProperty)):
                display_name = obj.display_name or name
                PropertyType.objects.create(
                    name=name,
                    type=PropertyType.FLOAT,
                    bound_to=extensible_type,
                    display_name=display_name)

        # # Now, since this item has been registered, we can save the data we set:
        # p1 = SpaceshipDefinedInCorePlugin()
        # p1.max_speed = 100
        # p1.save()


class ExtensibleTypeProperty(object):
    def __init__(self, display_name=None):
        self.display_name = display_name


class FloatProperty(ExtensibleTypeProperty):
    pass


# This plugin defines spaceships and space stations rather than samples and containers:
# class ExtensibleModelManager(models.Manager):
#     def get_queryset(self):
#         return super(ExtensibleModelManager, self).get_queryset().filter(author='Your mom')


class ExtensibleBase(models.Model):
    """
    Acts a proxy for ExtensibleType (TODO naming) and the associated properties.
    """

    def __init__(self, *args, **kwargs):
        # NOMERGE: The plugin name would be the name of the pip package, hardcoding for now:
        plugin = ("clims_snpseq", "1.0.0")

        # NOMERGE This mapping will surely need to be cached on a process level
        self._plugin = PluginRegistration.objects.get(name=plugin[0], version=plugin[1])
        self._extensible_type = ExtensibleType.objects.get(
            self.mama, plugin_registration=self._plugin)

        # Initializing an ExtensibleModel (TODO naming)
        self._extensible_instance = ExtensibleInstance(*args, **kwargs)

    def save(self, *args, **kwargs):
        self._extensible_instance.save()  # TODO: Props saved

    def __setattribute__(self, attr):
        # TODO: Validate here that the prop is on the model
        if attr not in ["max_speed"]:
            return super(ExtensibleBase, self).__setattribute__(attr)

    class Meta():
        # We don't want this class managed by Django, i.e. there should be no
        # tables generated for it.
        managed = False  # TODO: check if respected in 1.7


class SpaceshipDefinedInCorePlugin(ExtensibleBase):
    # TODO: The FloatField's parameters will not all be respected
    max_speed = models.FloatField()
