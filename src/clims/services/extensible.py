from __future__ import absolute_import

import logging
import six
from six import iteritems
from clims.models.extensible import (ExtensibleType, ExtensiblePropertyType,
                                     ExtensibleProperty)
from clims.models.location import SubstanceLocation
from django.db import transaction
from clims import utils
from clims.handlers import context_store

logger = logging.getLogger(__name__)


class ExtensibleTypeNotRegistered(Exception):
    pass


class ExtensibleService(object):
    def __init__(self, app):
        self._app = app
        self._model_cache = dict()
        self._implementations = None
        self._logger = logging.getLogger(self.__class__.__name__)

    def clear_cache(self):
        self._model_cache.clear()

    def create(self, name, klass, properties=None):
        """
        Creates an extensible and saves it to the backend.
        """
        if isinstance(klass, six.string_types):
            klass = self.get_implementation(klass)
        instance = klass(name=name)

        if properties:
            for key, val in properties.items():
                setattr(instance, key, val)

        instance.save()
        return instance

    def get_implementation(self, extensible_type_full_name):
        try:
            return self.implementations[extensible_type_full_name]
        except KeyError:
            raise ExtensibleTypeNotRegistered("The type {} is not registered anymore".format(
                extensible_type_full_name))

    def get_extensible_type(self, name):
        """
        Returns an extensible_type by name.
        """
        if name not in self._model_cache:
            try:
                substance_type = ExtensibleType.objects.prefetch_related(
                    'property_types').get(name=name)
                self._model_cache[name] = substance_type
            except ExtensibleType.DoesNotExist:
                raise ExtensibleTypeNotRegistered(
                    "The type '{}' is not registered".format(name))
        return self._model_cache[name]

    @property
    def implementations(self):
        if not self._implementations:
            extensible_types = self._app.plugins.get_extensible_types_from_db()
            self._implementations = dict()
            for ext_class in extensible_types:
                full_name = '{}.{}'.format(ext_class.__module__, ext_class.__name__)
                self._implementations[full_name] = ext_class
        return self._implementations

    def _list_all_cls_attributes_rec(self, cls, seed):
        for b in cls.__bases__:
            seed = self._list_all_cls_attributes_rec(b, seed)
        seed.update(cls.__dict__)
        return seed

    def register(self, plugin_reg, extensible_base):
        logger.info("Installing '{}' from plugin '{}@{}'".format(
            utils.class_full_name(extensible_base), plugin_reg.name,
            plugin_reg.version))

        property_types = list()
        seed = dict()
        cls_attributes = self._list_all_cls_attributes_rec(extensible_base, seed)
        for field in cls_attributes.values():
            if not isinstance(field, ExtensibleBaseField):
                continue

            prop_type = dict(
                name=field.prop_name,
                raw_type=field.raw_type,
                display_name=field.display_name)
            property_types.append(prop_type)

        name = "{}.{}".format(extensible_base.__module__, extensible_base.__name__)
        extensible_type = self._register_model(
            name, 'default', plugin_reg, property_types=property_types)
        return extensible_type

    def unregister_model(self, extensible_base, plugin):
        """
        This is for testing purposes only!
        """
        # trigger initiation of the implementation array
        self.implementations
        name = '{}.{}'.format(extensible_base.__module__, extensible_base.__name__)
        del(self._implementations[name])

    @transaction.atomic
    def _register_model(self, name, org, plugin, property_types=None):
        """
        Registers an extensible type in the database. One shouldn't have to call this method
        directly, but rather use `register`.
        """
        property_types = property_types or dict()
        for prop_type in property_types:
            if 'name' not in prop_type:
                raise Exception('Property name not supplied')

        extensible_type, created = ExtensibleType.objects.get_or_create(
            name=name, plugin=plugin)

        existing_property_types = {
            item.name: item
            for item in extensible_type.property_types.all()
        }

        for new_prop_type in property_types:
            prop_type = existing_property_types.get(new_prop_type['name'],
                                                    None)
            if not prop_type:
                prop_type = ExtensiblePropertyType(
                    extensible_type=extensible_type)
            for key, val in new_prop_type.items():
                setattr(prop_type, key, val)
            prop_type.save()

        return extensible_type


class Location(object):
    """
    Encapsulate equal operation and unpacking of a simple working
    unit of Location
    """

    def __init__(self, container, x, y, z):
        self.container = container
        self.x = x
        self.y = y
        self.z = z
        self.gen = self.mygen()

    def __eq__(self, other):
        return other.container.id == self.container.id and \
            other.x == self.x and other.y == self.y and other.z == self.z

    def __ne__(self, other):
        return not self.__eq__(other)

    def mygen(self):
        yield self.container
        yield self.x
        yield self.y
        yield self.z

    def next(self):
        return self.__next__()

    def __next__(self):
        try:
            return next(self.gen)
        except StopIteration:
            self.gen = self.mygen()
            raise StopIteration

    def __iter__(self):
        return self


class HasLocationMixin(object):
    """
    A mixin for extensibles that have a location
    """

    def move(self, container, index):
        """
        Set the location of this item to the particular index in the container.
        The index must have x, y and z.
        """
        # NOTE: This only saves the current location to the list of items we want to apply
        # in the end
        x, y, z = index
        trial_new_location = Location(container, x, y, z)
        has_new_location = not self.location or self.location != trial_new_location
        self._new_location = trial_new_location if has_new_location else None
        if has_new_location:
            # TODO: is dirty flag must be fully implemented
            self.is_dirty = True

    def _reset_previous_locations(self):
        # reset "current" flag on previous location instances
        previous_locations = SubstanceLocation.objects.filter(
            substance=self._wrapped_version.archetype,
            current=True,
        )
        for loc in previous_locations:
            loc.current = False
            loc.save()

    def _save_location(self):
        """
        Saves the current location. Needs to be called in any class that uses this mixin.
        """
        if self._new_location:
            self._reset_previous_locations()
            container, x, y, z = self._new_location
            new_location = SubstanceLocation(
                container=container._wrapped_version.archetype,
                substance=self._wrapped_version.archetype,
                x=x,
                y=y,
                z=z,
                container_version=container.version,
                substance_version=self.version,
                current=True)
            new_location.save()
            self._wrapped_version.archetype.location = new_location
            self._wrapped_version.archetype.save()


class ExtensibleBaseField(object):
    def __init__(self,
                 display_name=None,
                 nullable=True,
                 prop_name=None,
                 choices=None,
                 required=False,
                 help=None,
                 multiline=False):
        self.prop_name = prop_name
        self.display_name = display_name
        self.nullable = nullable
        self.choices = choices or list()
        self.required = required
        self.help = help
        self.multiline = multiline

    # TODO: The name and values of 'type' fits with what Sentry already had for their
    # dynamic forms. We should rename it if it causes confusion but then it might be better to
    # also rename all of the code related to dynamic (json) forms that Sentry already has,
    # e.g. app/data/forms/organizationGeneralSettings.jsx
    @property
    def type(self):
        # TODO: handle all the raw types we currently support and handle this in subclasses
        if len(self.choices) > 0:
            return 'select'
        elif self.multiline:
            return 'textarea'
        else:
            return 'string'

    @property
    def name(self):
        # TODO-simple: Rename prop_name to simply name
        return self.prop_name

    @property
    def label(self):
        return self.display_name

    def validate_numeric_zero(self, value, fn):
        # None and zero are valid numerical non-values
        if not value and value is False:
            raise ExtensibleTypeValidationError(
                "Value can not be interpreted as '{}'".format(fn.__name__))

    def validate_with_casting(self, value, fn):
        # None, zero or False values has to be tested specifically for each type!
        if not value:
            return
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
        if hasattr(obj, "_archetype"):
            try:
                prop_type = obj._archetype.extensible_type.property_types.get(
                    name=self.prop_name)
                self.validate(prop_type, value)
            except ExtensiblePropertyType.DoesNotExist:
                raise FieldDoesNotExist(self.prop_name)

        if value is None:
            if self.nullable:
                return
            else:
                raise ExtensibleTypeValidationError(
                    "None was not a valid value for Field: {}, if you want to "
                    "be able to set value to None, set nullable=True on "
                    "the Field.".format(self.prop_name))

    def __get__(self, obj, type=None):
        return obj._property_bag[self.prop_name]

    def __set__(self, obj, value):
        self._handle_validate(obj, value)
        obj._property_bag[self.prop_name] = value


class HasExtensibleFieldsMeta(type):
    """
    A meta class for classes that have extensible fields. Classes that have this metaclass
    can describe extensible statically on the object with this syntax:

        comment = FloatField()

    rather than:

        comment = FloatField(prop_name="comment")

    """
    def __new__(cls, name, bases, attrs):
        # Creates an instance of the class of the new extensible type
        cls_instance = super(HasExtensibleFieldsMeta,
                             cls).__new__(cls, name, bases, attrs)

        # Check all the fields of the new cls_instance, and add the name of the field
        # as a default label.
        for k, v in iteritems(cls_instance.__dict__):
            if isinstance(v, ExtensibleBaseField):
                if v.prop_name is None:
                    v.prop_name = k
                if v.display_name is None:
                    v.display_name = k
        return cls_instance


# TODO: Better naming
@six.add_metaclass(HasExtensibleFieldsMeta)
class ExtensibleCore(object):
    """
    Classes extending this class can have ExtensibleFields and they are required to run in a thread
    context created by clims.handlers.context_store.
    """

    def __init__(self, **kwargs):
        self._property_bag = DjangoBackedObjectPropertyBag(self)

    @property
    def _context(self):
        if not context_store.current:
            raise ExtensibleNotRunInHandlerContext()
        return context_store.current

    @classmethod
    def get_fields(cls):
        ret = list()
        for _, v in iteritems(cls.__dict__):
            if isinstance(v, ExtensibleBaseField):
                ret.append(v)
        return ret


class ExternalExtensibleBase(ExtensibleCore):
    """Represents an object that has extensible fields, just like `ExtensibleBase` objects, but
    which instances are not backed by the default database, but are kept in some external data
    source.
    """

    def __init__(self, **kwargs):
        super(ExternalExtensibleBase, self).__init__(**kwargs)
        self._property_bag = InMemoryPropertyBag()


class ExtensibleBase(ExtensibleCore):
    WrappedArchetype = None
    WrappedVersion = None
    require_name = False

    def __init__(self, name=None, **kwargs):
        """
        Creates an extensible object. Fundamentally, these are objects that can be extended by
        plugin developers, but they also have some other features that make them "smarter"
        than the basic database models. Extensible objects:

        * Can be extended easily by plugin developers, by only adding attributes to a class inheriting
          from it.
        * Have a full version history of any change that was made to the object
        * Proxy business logic that's routed to services in the ApplicationService
        * Have access to the context of the running thread, which means they already know which user
          initiated the original request and which organization they are.
        """

        # TODO: This class is used for e.g. SubstanceBase and ContainerBase which are tracked in
        # the database with the archetype and archetype_version models. But the Workflow class
        # does not require that, because there is no archetype or archetype_version, because
        # the workflow is tracked outside of our application's scope, in the workflow engine.
        super(ExtensibleBase, self).__init__(**kwargs)

        if self.WrappedArchetype is None:
            raise AssertionError("Class must define a WrappedArchetype")
        if self.WrappedVersion is None:
            raise AssertionError("Class must define a WrappedVersion")

        if not name and self.require_name:
            raise AssertionError("You must supply a name")
        self._name_before_change = None

        self._wrapped_version = kwargs.get("_wrapped_version", None)
        if self._wrapped_version:
            self._archetype = self._wrapped_version.archetype
            self.is_dirty = False
            # Stop here as we're wrapping a version that already exists
            return

        extensible_type = self._app.extensibles.get_extensible_type(self.type_full_name)
        self._archetype = self.WrappedArchetype(name=name, extensible_type=extensible_type,
                organization=self._context.organization)
        self._wrapped_version = self.WrappedVersion()

        # Add any remaining properties in kwargs. This is necessary so that user
        # can instantiate objects using e.g. syntax like: Sample(my_value=1)
        for key, value in six.iteritems(kwargs):
            assert key != "organization"
            setattr(self, key, value)

        # This is new, so we should set is_dirty to True:
        self.is_dirty = True

    @property
    def _app(self):
        return self._context.app

    def _save_custom(self, creating):
        """
        Custom save that's called after the extensible has saved, but in the same transaction.
        Intended for subclasses.
        """
        pass

    def _to_wrapper(self, model):
        # NOTE: It would be prettier to use an abstract class, but then we need to
        # ensure the abstract metaclass works with our metaclass.
        raise NotImplementedError("This method must be implemented in a base class")

    def iter_versions(self):
        """
        Iterate through all versions
        """
        from clims.models import ResultIterator
        qs = self._archetype.versions.order_by('version')
        return ResultIterator(qs, self._to_wrapper)

    @property
    def global_id(self):
        return self._archetype.global_id

    @transaction.atomic
    def save(self):
        creating = self.id is None
        if creating:
            self._archetype.save()
            self._wrapped_version.archetype = self._archetype
            self._wrapped_version.name = self._archetype.name
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
            new_version.name = self._archetype.name
            new_version.save()

            # Connect the new object with the properties on the old_version
            for prop in properties:
                new_version.properties.add(prop)

            self._archetype.versions.add(new_version)
            self._property_bag.save(new_version)
            self._wrapped_version = new_version
            self._archetype.save()

        self._save_custom(creating)
        self.is_dirty = False

    @property
    def id(self):
        """Returns the ID of the archetype.

        Use (self.id, self.version) as a unique key for versions of an extensible.
        """
        return self._archetype.id

    @property
    def organization(self):
        return self._archetype.organization

    @property
    def type_full_name(self):
        """
        Returns the full name of this type
        """
        return "{}.{}".format(self.__class__.__module__,
                              self.__class__.__name__)

    @classmethod
    def type_full_name_cls(cls):
        """
        Returns the full name of this type
        """
        return "{}.{}".format(cls.__module__, cls.__name__)

    @property
    def version(self):
        return self._wrapped_version.version

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
        return {
            prop.name: prop
            for prop in self._wrapped_version.properties.all()
        }


class FieldDoesNotExist(Exception):
    pass


class ExtensibleTypeValidationError(Exception):
    pass


class ExtensibleNotRunInHandlerContext(Exception):
    pass


class InMemoryPropertyBag(object):
    def __init__(self):
        self.store = dict()

    def __getitem__(self, key):
        return self.store.get(key, None)

    def __setitem__(self, key, value):
        self.store[key] = value


class DjangoBackedObjectPropertyBag(object):
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
                "Properties can't be saved before the extensible object has been saved"
            )

        def create(key, value):
            prop_type = versioned_object.archetype.extensible_type.property_types.get(
                name=key)
            prop = ExtensibleProperty(extensible_property_type=prop_type)
            prop.value = value
            prop.save()
            versioned_object.properties.add(prop)

        def update(key, value, old_prop):
            # Then, create a new entry with the new value with the same version
            # as the current extensible object
            prop_type = versioned_object.archetype.extensible_type.property_types.get(
                name=key)
            prop = ExtensibleProperty(extensible_property_type=prop_type)
            prop.value = value
            prop.save()
            versioned_object.properties.remove(old_prop)
            versioned_object.properties.add(prop)

        for key, value in self.new_values.items():
            try:
                prop = versioned_object.properties.get(
                    extensible_property_type__name=key)
                if prop.value == value:
                    continue
                update(key, value, prop)
            except ExtensibleProperty.DoesNotExist:
                create(key, value)

        # Note, new_values retained after save. Alternative would be to fetch from db and
        # re-initiate.

    def __getitem__(self, key):
        try:
            new_value = self.new_values.get(key, None)
            if new_value:
                return new_value

            # '.all_properties' is used to leverage the .prefetch_related() call
            # that is used when fetching the extensible
            if hasattr(self.extensible_wrapper._wrapped_version,
                       'all_properties'):
                properties = self.extensible_wrapper._wrapped_version.all_properties
                value = next(prop.value for prop in properties
                             if prop.extensible_property_type.name == key)
            else:
                value = self.extensible_wrapper._wrapped_version.properties.get(
                    extensible_property_type__name=key).value
            return value
        except ExtensibleProperty.DoesNotExist:
            return None

    def __setitem__(self, key, value):
        self.new_values[key] = value


class IntField(ExtensibleBaseField):
    def validate(self, prop_type, value):
        self.validate_numeric_zero(value, int)
        self.validate_with_casting(value, int)

    @property
    def raw_type(self):
        # NOTE: Implemented as a property as the constant we're using lies in the models and
        # we can't load the models too soon. It would be nice to change this!
        return ExtensiblePropertyType.INT


class BoolField(ExtensibleBaseField):
    def validate(self, prop_type, value):
        if not isinstance(value, bool):
            raise ExtensibleTypeValidationError(
                "Value can not be interpreted as bool")

    @property
    def raw_type(self):
        # NOTE: Implemented as a property as the constant we're using lies in the models and
        # we can't load the models too soon. It would be nice to change this!
        return ExtensiblePropertyType.BOOL


class FloatField(ExtensibleBaseField):
    def validate(self, prop_type, value):
        self.validate_numeric_zero(value, float)
        self.validate_with_casting(value, float)

    @property
    def raw_type(self):
        return ExtensiblePropertyType.FLOAT


class TextField(ExtensibleBaseField):
    def validate(self, prop_type, value):
        # None compatibility is already validated in base class.
        if value is not None and not isinstance(value, six.string_types):
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
