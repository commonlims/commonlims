

from django.db import models
from sentry.db.models import (Model, sane_repr, FlexibleForeignKey)
import json


class ExtensibleModel(Model):
    """
    Base class for extensible models
    """
    __core__ = False

    extensible_type = FlexibleForeignKey('clims.ExtensibleType')

    created_at = models.DateTimeField(auto_now_add=True)

    # Note that extensible models should never be updated. This is provided for consistency
    # and auditing purposes.
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class ExtensibleVersion(Model):
    """
    Represents a particular version of an Extensible

    Parent/Child relationship is always between a particular version of an Extensible.
    """
    __core__ = False

    # Name of the entity at this version. This will almost always be the same, but we copy it
    # to make querying simpler.
    name = models.TextField(null=True)

    version = models.IntegerField(default=1)

    latest = models.BooleanField(default=True)

    properties = models.ManyToManyField('clims.ExtensibleProperty')

    class Meta:
        abstract = True


class ExtensibleType(Model):
    """
    Extensible objects are models that can be extended by plugin developers without
    a django migration. They are defined programmatically in the plugin and registered
    when running `lims upgrade`.

    These types are examples of those that will be extensible, meaning that they can
    be customized by plugins.

    * Substance
    * Container
    * Project
    """
    __core__ = True

    name = models.TextField()

    plugin = models.ForeignKey('clims.PluginRegistration')

    @property
    def full_name(self):
        return "{}.{}.{}".format(self.plugin.name, self.category, self.name)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_extensibletype'

    __repr__ = sane_repr('name')


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

    def get_value_field(self):
        raw_type = self.raw_type
        if raw_type == ExtensiblePropertyType.INT:
            return "int_value"
        elif raw_type == ExtensiblePropertyType.FLOAT:
            return "float_value"
        elif raw_type == ExtensiblePropertyType.STRING or raw_type == ExtensiblePropertyType.JSON:
            return "string_value"
        elif raw_type == ExtensiblePropertyType.BOOL:
            return "bool_value"
        else:
            raise AssertionError("Unexpected raw type {}".format(raw_type))

    class Meta:
        app_label = 'clims'
        db_table = 'clims_extensiblepropertytype'

    __repr__ = sane_repr('name', 'raw_type')


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
    __core__ = False

    extensible_property_type = models.ForeignKey("clims.ExtensiblePropertyType")

    # Supported values (TODO: add more)
    float_value = models.FloatField(null=True)
    int_value = models.IntegerField(null=True)
    string_value = models.TextField(null=True)
    bool_value = models.NullBooleanField(null=True)

    def __init__(self, *args, **kwargs):
        super(ExtensibleProperty, self).__init__(*args, **kwargs)

    def _get_field_from_type(self):
        return self.extensible_property_type.get_value_field()

    def _serialize(self, value):
        raw_type = self.extensible_property_type.raw_type
        if raw_type == ExtensiblePropertyType.JSON:
            return json.dumps(value)
        else:
            return value

    def _deserialize(self, value):
        raw_type = self.extensible_property_type.raw_type
        if raw_type == ExtensiblePropertyType.JSON:
            return json.loads(value)
        else:
            return value

    @property
    def name(self):
        if not self.extensible_property_type:
            return None
        return self.extensible_property_type.name

    @property
    def display_name(self):
        if not self.extensible_property_type:
            return None
        return self.extensible_property_type.display_name

    @property
    def value(self):
        field_name = self._get_field_from_type()
        return self._deserialize(getattr(self, field_name))

    @value.setter
    def value(self, val):
        field_name = self._get_field_from_type()
        setattr(self, field_name, self._serialize(val))

    class Meta:
        app_label = 'clims'
        db_table = 'clims_extensibleproperty'

    __repr__ = sane_repr('name', 'value', 'display_name')
