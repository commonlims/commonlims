from __future__ import absolute_import, print_function

from django.db import models
from sentry.db.models import (Model, sane_repr)
import json


class ExtensibleType(Model):
    """
    Extensible objects are models that can be extended by plugin developers without
    a django migration. They are defined programmatically in the plugin and registered
    when running `lims upgrade`.

    These types are examples of those that will be extensible, meaning that they can
    be customized by plugins. Currently the Substance is the only one that's implemented.

    * Substance
    * Container
    * Project
    """
    __core__ = True

    name = models.TextField()
    category = models.TextField()
    plugin = models.ForeignKey('clims.PluginRegistration')

    class Meta:
        app_label = 'clims'
        db_table = 'clims_extensibletype'


class ExtensiblePropertyType(Model):
    """
    Defines the type of an ExtensibleProperty.

    """
    __core__ = True

    name = models.TextField(null=False)

    display_name = models.TextField(null=True)

    STRING = 's'
    JSON = 'j'
    INT = 'i'
    FLOAT = 'f'
    BOOL = 'b'

    TYPE_CHOICES = (
        (STRING, 'string'),
        (JSON, 'json'),
        (INT, 'int'),
        (FLOAT, 'float'),
        (BOOL, 'bool'),
    )

    extensible_type = models.ForeignKey('clims.ExtensibleType', related_name='property_types')

    raw_type = models.TextField(
        choices=TYPE_CHOICES,
        null=False,
    )

    class Meta:
        app_label = 'clims'
        db_table = 'clims_extensiblepropertytype'


class ExtensiblePropertyValue(Model):
    """
    The value of an extensible property.

    Values of ExtensibleProperties are kept separate from the ExtensibleProperty because they
    may be reused by inherited objects.

    Example:

    doc = '<large document>'
    sample1 = substances.create('sample1', ..., properties={doc=doc})
    aliquot1 = substances.copy(sample, 'aliquot1')

    The "large document" is not copied in the database since it hasn't changed.

    If someone later changes the property on either sample1 or aliquot1, the other
    object will not be affected, because a new value will be created.
    """

    __core__ = True

    # Supported values (TODO: add more)
    float_value = models.FloatField(null=True)
    int_value = models.IntegerField(null=True)
    string_value = models.TextField(null=True)
    bool_value = models.NullBooleanField(null=True)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_extensiblepropertyvalue'


class ExtensibleProperty(Model):
    """
    A class for properties that can be hooked up to `Extensible` objects.

    Already implemented:
      * Bound to a `Substance`

    Will be implemented:
      * Bound to a `Container`
      * Bound to a `Project`

    Properties are versioned based on the version of the Extensible at the time they were
    bound to it.

    The type of a property is determined by a plugin when the system is upgraded. They are
    modelled with `ExtensiblePropertyType`.
    """
    __core__ = True

    version = models.IntegerField(null=False, default=1)

    # True if this is the latest version of this instance
    latest = models.BooleanField(null=False, default=True)

    extensible_property_type = models.ForeignKey("clims.ExtensiblePropertyType")

    extensible_property_value = models.ForeignKey("clims.ExtensiblePropertyValue")

    def __init__(self, *args, **kwargs):
        super(ExtensibleProperty, self).__init__(*args, **kwargs)
        self.is_versioned = kwargs.get('is_versioned', True)

    @property
    def name(self):
        if not self.extensible_property_type:
            return None
        return self.extensible_property_type.name

    @property
    def value(self):
        if not self.extensible_property_value:
            return None
        raw_type = self.extensible_property_type.raw_type
        if raw_type == ExtensiblePropertyType.INT:
            return self.extensible_property_value.int_value
        elif raw_type == ExtensiblePropertyType.FLOAT:
            return self.extensible_property_value.float_value
        elif raw_type == ExtensiblePropertyType.STRING:
            return self.extensible_property_value.string_value
        elif raw_type == ExtensiblePropertyType.BOOL:
            return self.extensible_property_value.bool_value
        elif raw_type == ExtensiblePropertyType.JSON:
            return json.loads(self.extensible_property_value.string_value)
        else:
            raise ValueError("Unexpected raw type {}".format(raw_type))

    def create_extensible_property_value(self, value):
        """
        Creates a property value that fits with the type of this property
        """
        ret = ExtensiblePropertyValue()
        raw_type = self.extensible_property_type.raw_type
        if raw_type == ExtensiblePropertyType.INT:
            ret.int_value = value
        elif raw_type == ExtensiblePropertyType.FLOAT:
            ret.float_value = value
        elif raw_type == ExtensiblePropertyType.STRING:
            ret.string_value = value
        elif raw_type == ExtensiblePropertyType.BOOL:
            ret.bool_value = value
        elif raw_type == ExtensiblePropertyType.JSON:
            ret.string_value = json.dumps(value)
        else:
            raise ValueError("Unexpected raw type {}".format(raw_type))
        return ret

    class Meta:
        app_label = 'clims'
        db_table = 'clims_extensibleproperty'

    __repr__ = sane_repr('version', 'value', 'latest')
