from __future__ import absolute_import

import six
from clims.models.extensible import ExtensibleType, ExtensiblePropertyType, ExtensibleProperty
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
        Returns an extensible_type by name.
        """
        if (org.id, name) not in self._model_cache:
            try:
                substance_type = ExtensibleType.objects.prefetch_related(
                    'property_types').get(plugin__organization=org, name=name)
                self._model_cache[(org.id, name)] = substance_type
            except ExtensibleType.DoesNotExist:
                raise ExtensibleTypeNotRegistered("The type '{}' is not registered in '{}'".format(
                    name, org.slug))
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
        from clims.services.application import ioc
        self._app = ioc.app
        self._property_bag = PropertyBag(self)
        self._name_before_change = None
        self._wrapped_version = kwargs.get("_wrapped_version", None)
        if self._wrapped_version:
            self._archetype = self._wrapped_version.archetype
            # Stop here if we're wrapping a version that already exists
            return

        name = kwargs.pop("name", None)
        org = kwargs.pop("organization", None)

        if not name or not org:
            raise AttributeError("You must supply name and organization")

        extensible_type = self._app.extensibles.get_extensible_type(org, self.type_full_name)
        self._archetype = self.WrappedArchetype(name=name, extensible_type=extensible_type,
                organization=org)
        self._wrapped_version = self.WrappedVersion()

        # Add any remaining properties in kwargs. This is necessary so that user
        # can instantiate objects using e.g. syntax like: Sample(my_value=1)
        for key, value in six.iteritems(kwargs):
            setattr(self, key, value)

    def _save_subclass_specifics(self, creating):
        # override this!
        pass

    @transaction.atomic
    def save(self):
        creating = self.id is None
        if creating:
            self._archetype.save()
            self._wrapped_version.archetype = self._archetype
            self._wrapped_version.save()
            self._property_bag.save(self._wrapped_version)
        else:
            # Updating
            old_version = self._archetype.versions.get(latest=True)
            old_version.latest = False
            old_version.save()
            properties = old_version.properties.all()

            new_version = old_version
            new_version.pk = None
            new_version.version += 1
            new_version.latest = True
            new_version.previous_name = self._name_before_change
            new_version.save()

            # Connect the new object with the properties on the old_version
            for prop in properties:
                new_version.properties.add(prop)

            self._archetype.versions.add(new_version)
            self._property_bag.save(new_version)
            self._wrapped_version = new_version

        self._save_subclass_specifics(creating)

    @property
    def id(self):
        """Returns the ID of the archetype.

        Use (self.id, self.version) as a unique key for versions of an extensible.
        """
        return self._archetype.id

    @property
    def type_full_name(self):
        """
        Returns the full name of this type
        """
        return "{}.{}".format(self.__class__.__module__, self.__class__.__name__)

    @property
    def name(self):
        return self._archetype.name

    @name.setter
    def name(self, value):
        if self._name_before_change is None:
            self._name_before_change = self._archetype.name
        self._archetype.name = value

    @property
    def created_at(self):
        return self._archetype.created_at

    @property
    def updated_at(self):
        return self._archetype.updated_at

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
    def __init__(self, prop_name=None, display_name=None, nullable=True):
        # TODO: Create a metaclass for SubstanceBase that ensures prop_name is always set
        self.prop_name = prop_name
        self.display_name = display_name or prop_name
        self.nullable = nullable

    def validate_with_casting(self, value, fn):
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

    def validate(self, prop_type, value):
        # Override this in subclasses
        pass

    def _handle_validate(self, obj, value):
        try:
            prop_type = obj._archetype.extensible_type.property_types.get(name=self.prop_name)
        except ExtensiblePropertyType.DoesNotExist:
            raise FieldDoesNotExist(self.prop_name)

        if value is None:
            if self.nullable:
                return
            else:
                raise ExtensibleTypeValidationError("None was not a valid value for Field: {}, if you want to "
                                                    "be able to set value to None, set nullable=True on "
                                                    "the Field.".format(self.prop_name))

        self.validate(prop_type, value)

    def __get__(self, obj, type=None):
        return obj._property_bag[self.prop_name]

    def __set__(self, obj, value):
        self._handle_validate(obj, value)
        obj._property_bag[self.prop_name] = value


class ExtensibleTypeValidationError(Exception):
    pass


class PropertyBag(object):
    """
    Handles properties on an extensible object.
    """

    def __init__(self, extensible_wrapper):
        # TODO: validation should happen here
        # TODO: Move versioning of properties here from the service
        self.extensible_wrapper = extensible_wrapper
        self.new_values = dict()

    def save(self, versioned_object):
        """
        Saves the properties to django objects. Must be called after the wrapped class
        has been saved.
        """
        # TODO: Make sure we're not trying to save to a "latest" entry
        if not self.extensible_wrapper.id:
            raise AssertionError(
                "Properties can't be saved before the extensible object has been saved")

        def create(key, value):
            prop_type = versioned_object.archetype.extensible_type.property_types.get(name=key)
            prop = ExtensibleProperty(extensible_property_type=prop_type)
            prop.value = value
            prop.save()
            versioned_object.properties.add(prop)

        def update(key, value, old_prop):
            # Then, create a new entry with the new value with the same version
            # as the current extensible object
            prop_type = versioned_object.archetype.extensible_type.property_types.get(name=key)
            prop = ExtensibleProperty(extensible_property_type=prop_type)
            prop.value = value
            prop.save()
            versioned_object.properties.remove(old_prop)
            versioned_object.properties.add(prop)

        for key, value in self.new_values.items():
            try:
                prop = versioned_object.properties.get(extensible_property_type__name=key)
                if prop.value == value:
                    continue
                update(key, value, prop)
            except ExtensibleProperty.DoesNotExist:
                create(key, value)

        self.new_values.clear()

    def __getitem__(self, key):
        try:
            new_value = self.new_values.get(key, None)
            if new_value:
                return new_value
            persisted_value = self.extensible_wrapper._wrapped_version.properties.get(
                extensible_property_type__name=key)
            return persisted_value.value
        except ExtensibleProperty.DoesNotExist:
            return None

    def __setitem__(self, key, value):
        self.new_values[key] = value


class IntField(ExtensibleBaseField):
    def validate(self, prop_type, value):
        self.validate_with_casting(value, int)

    @property
    def raw_type(self):
        # NOTE: Implemented as a property as the constant we're using lies in the models and
        # we can't load the models too soon. It would be nice to change this!
        return ExtensiblePropertyType.INT


class FloatField(ExtensibleBaseField):
    def validate(self, prop_type, value):
        self.validate_with_casting(value, float)

    @property
    def raw_type(self):
        return ExtensiblePropertyType.FLOAT


class TextField(ExtensibleBaseField):
    def validate(self, prop_type, value):
        if not isinstance(value, six.string_types):
            raise ExtensibleTypeValidationError("Expected string")

    @property
    def raw_type(self):
        return ExtensiblePropertyType.STRING


class JsonField(ExtensibleBaseField):
    def validate(self, prop_type, value):
        import json
        json.dumps(value)

    @property
    def raw_type(self):
        return ExtensiblePropertyType.JSON
