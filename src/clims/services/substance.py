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

    def get_substance_type(self, org, name):
        """
        Returns a substance_type by name. Can be cached.
        """
        if (org.id, name) not in self.cache:
            substance_type = ExtensibleType.objects.prefetch_related('property_types').get(organization=org, name=name)
            self.cache[(org.id, name)] = substance_type
        return self.cache[(org.id, name)]

    @transaction.atomic
    def copy(self, parent, new_name=None, overridden_properties=None):
        """
        Copies the parent, giving it a new_name. If new_name is not supplied it will get a unique name
        based on the name of the parent.
        """
        overridden_properties = overridden_properties or dict()

        if not new_name:
            new_name = "{}:{}".format(parent.name, uuid4())

        child = Substance(name=new_name, organization=parent.organization, extensible_type=parent.extensible_type)
        child.depth = parent.depth + 1
        child.save()

        # Origin points to the first ancestor(s) of this substance. If the substance being cloned
        # has origins, we'll get the same origins. Otherwise the substance being cloned is the origin

        if len(parent.origins.all()) == 0:
            child.origins.add(parent)
        else:
            for origin in parent.origins.all():
                child.origins.add(origin)

        child.parents.add(parent)

        # Create candidate props
        for prop in parent.properties.all():
            if prop.name in overridden_properties and prop.value != overridden_properties[prop.name]:
                val = prop.create_extensible_property_value(overridden_properties[prop.name])
                val.save()
            else:
                # Point to the original value as we don't copy property values without it being required.
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
            extensible_type = self.get_substance_type(organization, extensible_type)

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
        substance = Substance.objects.get(name=name, organization=organization, extensible_type=extensible_type)
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

    @transaction.atomic
    def register_type(self, name, org, plugin, category='default', properties=None):
        properties = properties or dict()
        substance_type, _ = ExtensibleType.objects.get_or_create(
            name=name,
            category=category,
            plugin=plugin)

        for kwargs in properties:
            ExtensiblePropertyType.objects.get_or_create(
                extensible_type=substance_type, **kwargs)
        return substance_type


substances = SubstanceService()
