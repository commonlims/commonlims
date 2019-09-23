from __future__ import absolute_import

from clims.services.substance import ExtensibleBaseField
from clims.models import ExtensibleType, ExtensiblePropertyType
from django.db import transaction


class ExtensibleService(object):
    def register(self, plugin, extensible_base):
        property_types = list()
        for field in extensible_base.__dict__.values():
            if not isinstance(field, ExtensibleBaseField):
                continue

            prop_type = dict(
                name=field.prop_name,
                raw_type=field.raw_type,
                display_name=field.display_name)
            property_types.append(prop_type)

        name = "{}.{}".format(extensible_base.__module__, extensible_base.__name__)
        extensible_type = self._register_model(
            name, 'default', plugin, property_types=property_types)
        return extensible_type

    @transaction.atomic
    def _register_model(self, name, org, plugin, category='default', property_types=None):
        """
        Registers an extensible type in the database. One shouldn't have to call this method
        directly, but rather use `register`.
        """
        property_types = property_types or dict()
        for prop_type in property_types:
            if 'name' not in prop_type:
                raise Exception('Property name not supplied')

        extensible_type, created = ExtensibleType.objects.get_or_create(
            name=name,
            category=category,
            plugin=plugin)

        existing_property_types = {item.name: item for item in extensible_type.property_types.all()}

        for new_prop_type in property_types:
            prop_type = existing_property_types.get(new_prop_type['name'], None)
            if not prop_type:
                prop_type = ExtensiblePropertyType(extensible_type=extensible_type)
            for key, val in new_prop_type.items():
                setattr(prop_type, key, val)
            prop_type.save()

        return extensible_type


extensibles = ExtensibleService()
