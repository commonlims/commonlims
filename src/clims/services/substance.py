from __future__ import absolute_import

import six

from clims.models import Substance, ExtensiblePropertyType, ExtensibleProperty, ExtensibleType
from django.db import transaction
from django.db.models import FieldDoesNotExist
from uuid import uuid4


class SubstanceService(object):
    """
    Provides an API for dealing with both substances (samples, aliquots etc.)
    and their associated containers.

    Plugins change the state of the system only via service classes or REST API
    calls. Access to lower-level APIs is possible, but not suggested to ensure
    backwards compatibility and business rule constraints.

    NOTE: Use this class instead of the manager on Substance even in framework code (unless
    you're sure of what you're doing) because interaction of the substance and its properties must
    be strictly maintained.
    """

    def __init__(self):
        self.cache = dict()

    def get_extensible_type(self, org, name):
        """
        Returns an extensible_type by name. Can be cached.
        """

        # TODO: This should be in a service only for extensible types, as we'll
        # require this for ex. containers too.
        if (org.id, name) not in self.cache:
            substance_type = ExtensibleType.objects.prefetch_related(
                'property_types').get(plugin__organization=org, name=name)
            self.cache[(org.id, name)] = substance_type
        return self.cache[(org.id, name)]

    @transaction.atomic
    def copy(self, parent, new_name=None, overridden_properties=None):
        """
        Copies the parent, giving it a new_name. If new_name is not supplied it
        will get a unique name based on the name of the parent.
        """
        overridden_properties = overridden_properties or dict()

        if not new_name:
            new_name = "{}:{}".format(parent.name, uuid4())

        child = Substance(
            name=new_name,
            organization=parent.organization,
            extensible_type=parent.extensible_type)
        child.depth = parent.depth + 1
        child.save()

        # Origin points to the first ancestor(s) of this substance. If the substance being cloned
        # has origins, we'll get the same origins. Otherwise the substance being
        # cloned is the origin

        if len(parent.origins.all()) == 0:
            child.origins.add(parent)
        else:
            for origin in parent.origins.all():
                child.origins.add(origin)

        child.parents.add(parent)

        # Create candidate props
        for prop in parent.properties.all():
            if (prop.name in overridden_properties and
                    prop.value != overridden_properties[prop.name]):
                val = prop.create_extensible_property_value(overridden_properties[prop.name])
                val.save()
            else:
                # Point to the original value as we don't copy property values without it
                # being required.
                val = prop.extensible_property_value
            cloned_prop = ExtensibleProperty()
            cloned_prop.extensible_property_value = val
            cloned_prop.extensible_property_type = prop.extensible_property_type
            cloned_prop.save()
            child.properties.add(cloned_prop)
        return child

    @transaction.atomic
    def create(self, name, extensible_type, organization, properties=None):
        if isinstance(extensible_type, six.text_type):
            extensible_type = self.get_extensible_type(organization, extensible_type)

        properties = properties or dict()
        substance = Substance(name=name, organization=organization, extensible_type=extensible_type)
        substance.save()

        for key, value in properties.items():
            try:
                property_type = extensible_type.property_types.get(name=key)
            except ExtensiblePropertyType.DoesNotExist:
                raise FieldDoesNotExist("The field '{}' doesn't exist on '{}'".format(
                    key, extensible_type))
            prop = ExtensibleProperty(extensible_property_type=property_type)
            prop.version = substance.version
            val_model = prop.create_extensible_property_value(value)
            val_model.save()
            prop.extensible_property_value = val_model
            prop.save()
            substance.properties.add(prop)
        return substance

    @transaction.atomic
    def update(self, name, organization, extensible_type, properties=None):
        """
        Updates properties on a substance.
        """
        if not properties:
            properties = dict()

        # The substance itself remains the same physicial row in the db, but the
        # version is increased
        substance = Substance.objects.get(
            name=name,
            organization=organization,
            extensible_type=extensible_type)
        substance.version += 1
        substance.save()

        # We create a copy of the model and save it with a new version
        for key, value in properties.items():
            prop = substance.properties.get(extensible_property_type__name=key)

            if prop.value == value:
                # We simply ignore updates that don't change anything
                continue

            # First, mark the old prop as not-latest. It will maintain in the database
            # forever (unless cleaned up explicitly) and can be queried as required.
            prop.latest = False
            prop.save()

            # Then, create a new entry with the new value with the same version
            # as the current substance object
            new_val = prop.create_extensible_property_value(properties[key])
            new_val.save()
            prop.extensible_property_value = new_val

            prop.version = substance.version
            prop.latest = True
            prop.pk = None  # This leads to a new object being created
            prop.save()
            substance.properties.add(prop)

        return substance


class ExtensibleBaseField(object):
    def __init__(self, prop_name=None, display_name=None):
        # TODO: Create a metaclass for SubstanceBase that ensures prop_name is always set
        self.prop_name = prop_name
        self.display_name = display_name or prop_name

    def validate(self, prop_type, value):
        # Override this in subclasses
        pass

    def _handle_validate(self, obj, value):
        prop_type = obj._wrapped.extensible_type.property_types.get(name=self.prop_name)
        self.validate(prop_type, value)

    def __get__(self, obj, type=None):
        return obj.properties[self.prop_name]

    def __set__(self, obj, value):
        self._handle_validate(obj, value)
        obj.properties[self.prop_name] = value


class ExtensibleTypeValidationError(Exception):
    pass


def validate_with_casting(value, fn):
    valid = True
    try:
        cast = fn(value)
        if cast != value:
            valid = False
    except ValueError:
        valid = False

    if not valid:
        raise ExtensibleTypeValidationError(
            "Value can not be interpreted as '{}'".format(fn.__name__))


class IntField(ExtensibleBaseField):
    def validate(self, prop_type, value):
        validate_with_casting(value, int)

    @property
    def raw_type(self):
        # NOTE: Implemented as a property as the constant we're using lies in the models and
        # we can't load the models too soon. It would be nice to change this!
        from clims.models import ExtensiblePropertyType
        return ExtensiblePropertyType.INT


class FloatField(ExtensibleBaseField):
    def validate(self, prop_type, value):
        validate_with_casting(value, float)

    @property
    def raw_type(self):
        from clims.models import ExtensiblePropertyType
        return ExtensiblePropertyType.FLOAT


class TextField(ExtensibleBaseField):
    def validate(self, prop_type, value):
        if not isinstance(value, six.string_types):
            raise ExtensibleTypeValidationError("Expected string")

    @property
    def raw_type(self):
        from clims.models import ExtensiblePropertyType
        return ExtensiblePropertyType.STRING


class ExtensibleBase(object):
    pass


class SubstanceBase(ExtensibleBase):
    """
    A base object for defining substances in the system, e.g. Sample, Aliquot or Pool.

    Details:

    Under the hood, this object wraps a Substance object and its related Extensible* classes.
    """

    def __init__(self, name, org, **kwargs):
        type_name = "{}.{}".format(self.__class__.__module__, self.__class__.__name__)
        self.properties = kwargs
        extensible_type = substances.get_extensible_type(org, type_name)
        self._wrapped = Substance(name=name, extensible_type=extensible_type, organization=org)

    @property
    def name(self):
        return self._wrapped.name

    def save(self):
        if self._wrapped.id:
            pass  # UPDATE
        else:
            self._wrapped = substances.create(
                self._wrapped.name,
                self._wrapped.extensible_type,
                self._wrapped.organization,
                properties=self.properties)


substances = SubstanceService()
