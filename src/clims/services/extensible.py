from __future__ import absolute_import

import six
from clims.models import ExtensibleType, ExtensiblePropertyType
from django.db import transaction


class ExtensibleTypeNotRegistered(Exception):
    pass


class ExtensibleService(object):
    def __init__(self, app):
        self._app = app
        self._implementations = dict()
        self._model_cache = dict()

    def clear_cache(self):
        self._model_cache.clear()

    def create(self, name, klass, organization, properties=None):
        """
        Creates an extensible and saves it to the backend.
        """
        if isinstance(klass, six.string_types):
            klass = self.get_implementation(klass)
        instance = klass(name=name, organization=organization, _app=self._app)

        if properties:
            for key, val in properties.items():
                setattr(instance, key, val)

        instance.save()
        return instance

    def get_implementation(self, extensible_type_full_name):
        try:
            return self._implementations[extensible_type_full_name]
        except KeyError:
            raise ExtensibleTypeNotRegistered(extensible_type_full_name)

    def get_extensible_type(self, org, name):
        """
        Returns an extensible_type by name. Can be cached.
        """
        if (org.id, name) not in self._model_cache:
            substance_type = ExtensibleType.objects.prefetch_related(
                'property_types').get(plugin__organization=org, name=name)
            self._model_cache[(org.id, name)] = substance_type
        return self._model_cache[(org.id, name)]

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
        self._implementations[name] = extensible_base
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


class ExtensibleBase(object):
    def __init__(self, **kwargs):
        pass

    @property
    def id(self):
        """Returns the ID of the substance.

        Use (self.id, self.version) as a unique key for versions of a substance.
        """
        return self._wrapped.id

    @property
    def type_full_name(self):
        """
        Returns the full name of this type
        """
        return "{}.{}".format(self.__class__.__module__, self.__class__.__name__)

    @property
    def name(self):
        return self._wrapped.name

    @name.setter
    def name(self, value):
        if self._name_before_change is None:
            self._name_before_change = self._wrapped.name
        self._wrapped.name = value

    @property
    def created_at(self):
        return self._wrapped.created_at

    @property
    def updated_at(self):
        return self._wrapped.updated_at

    @property
    def properties(self):
        """
        Returns the properties as a dictionary.

        Note that one must use `.value` to get to the actual value of the property, e.g.:

        >>>   sample.properties['color'].value
        """
        return {prop.name: prop for prop in self._wrapped_version.properties.all()}


class FieldDoesNotExist(Exception):
    pass


class ExtensibleBaseField(object):
    def __init__(self, prop_name=None, display_name=None):
        # TODO: Create a metaclass for SubstanceBase that ensures prop_name is always set
        self.prop_name = prop_name
        self.display_name = display_name or prop_name

    def validate(self, prop_type, value):
        # Override this in subclasses
        pass

    def _handle_validate(self, obj, value):
        try:
            prop_type = obj._wrapped.extensible_type.property_types.get(name=self.prop_name)
        except ExtensiblePropertyType.DoesNotExist:
            raise FieldDoesNotExist(self.prop_name)
        self.validate(prop_type, value)

    def __get__(self, obj, type=None):
        return obj._property_bag[self.prop_name]

    def __set__(self, obj, value):
        self._handle_validate(obj, value)
        obj._property_bag[self.prop_name] = value


class ExtensibleTypeValidationError(Exception):
    pass
