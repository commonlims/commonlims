from __future__ import absolute_import

import six
from django.db.models import Prefetch
from django.core import exceptions as django_exceptions
from clims.services.exceptions import DoesNotExist
from clims.models.extensible import ExtensibleProperty
from clims.services.extensible import ExtensibleTypeNotRegistered


class BaseExtensibleService(object):

    DoesNotExist = DoesNotExist

    def __init__(self, app, wrapper_class):
        self._app = app

        self._wrapper_class = wrapper_class
        self._archetype_class = wrapper_class.WrappedArchetype
        self._archetype_version_class = wrapper_class.WrappedVersion

    def to_wrapper(self, model):
        if model is None:
            return None
        if isinstance(model, self._archetype_version_class):
            return self._version_to_wrapper(model)
        elif isinstance(model, self._archetype_class):
            return self._archetype_to_wrapper(model)
        else:
            raise AssertionError("The model {} can't be wrapped".format(type(model)))

    def _version_to_wrapper(self, version):
        try:
            SpecificExtensibleType = self._app.extensibles.get_implementation(
                version.archetype.extensible_type.name)
            return SpecificExtensibleType(_wrapped_version=version, _app=self._app)
        except ExtensibleTypeNotRegistered:
            return self._archetype_base_class(_wrapped_version=version, _unregistered=True)

    def _archetype_to_wrapper(self, archetype):
        versioned = archetype.versions.get(latest=True)
        return self._version_to_wrapper(versioned)

    def all(self):
        """
        Returns all instances of an extensible. Only the latest version is
        returned.
        """
        # TODO: We should filter by organization

        # TODO: It would be preferable if we could return a regular django queryset here,
        # which in turn would return the wrapper when materialized. For that to work smoothly,
        # we'll need to look into implementation details of django querysets.

        # TODO: how does the prefetch perform when fetching all objects like this
        for entry in self._all_qs():
            yield self.to_wrapper(entry)

    def _all_qs(self):
        """Returns a queryset for all extensible of a particular version or latest if nothing
        is supplied

        Note that you must call SubstanceService.to_wrapper to wrap it as a high level object.
        In general you should not use this method.
        """

        # TODO: `all` should return a queryset that automatically wraps the Django object and
        # after that we can remove methods named `*_qs`.

        return self._archetype_version_class.objects.filter(latest=True).prefetch_related('properties')

    def _search_qs(self, query, search_key):
        # TODO: We'll have the same api for projects and containers, but for now we'll keep this
        # here for simplicity

        # TODO: We will offload all search (and sorting) of substances (as well as other things)
        # to elastic. For now we throw an error if the search isn't just 'project.name:'

        # TODO: The api for searching will be elastic's, so we just have a super simple parsing
        # for now:

        if query is None:
            return self._all_qs()

        query = query.strip()
        query = query.split(" ")
        if len(query) > 1:
            raise NotImplementedError("Complex queries are not yet supported")

        query = query[0]
        key, val = query.split(":")

        if key == search_key:
            # TODO: the search parameter indicates we're looking for a substance that's a sample
            # so add a category or similar so it doesn't find other things that are in a container.
            return self._archetype_version_class.objects.filter(
                latest=True, name__icontains=val).prefetch_related('properties')
        else:
            raise NotImplementedError("The key {} is not implemented".format(key))

    def filter(self, **kwargs):
        order_by_arg = kwargs.pop('order_by', None)
        get_args = self._get_filter_arguments(**kwargs)
        models = self._archetype_version_class.objects.prefetch_related(
            Prefetch('properties', to_attr='all_properties'),
            Prefetch('all_properties__extensible_property_type')).\
            filter(**get_args)
        if order_by_arg:
            models = models.order_by(order_by_arg)
        return [self.to_wrapper(m) for m in models]

    def get(self, **kwargs):
        try:
            get_args = self._get_filter_arguments(**kwargs)
            model = self._archetype_version_class.objects.prefetch_related(
                Prefetch('properties', to_attr='all_properties'),
                Prefetch('all_properties__extensible_property_type')).\
                get(**get_args)
            return self.to_wrapper(model)
        except django_exceptions.ObjectDoesNotExist as e:
            # TODO-simple: Map to CLIMS exceptions in all service methods that use django, since
            # we don't want users to have to import from django.
            raise DoesNotExist(six.text_type(e))

    def _get_filter_arguments(self, **kwargs):
        get_args = {}
        if 'latest' not in kwargs.keys():
            kwargs['latest'] = True

        for key, value in kwargs.items():
            if key == 'project':
                get_args['archetype__project__name'] = value.name
            elif key == 'project_name':
                get_args['archetype__project__name'] = value
            elif key == 'latest':
                get_args['{}'.format(key)] = value
            else:
                get_args['archetype__{}'.format(key)] = value
        return get_args

    @staticmethod
    def _get_values_qs(property, extensible_type):
        extensible_type_name = extensible_type.type_full_name_cls()
        property_query_set = ExtensibleProperty.objects.filter(
            extensible_property_type__extensible_type__name=extensible_type_name,
            extensible_property_type__name=property).select_related('extensible_property_type')
        return property_query_set

    @staticmethod
    def get_values_of_property(property, extensible_type):
        property_query_set = BaseExtensibleService._get_values_qs(property, extensible_type)
        try:
            # Note that this assumes that the property type is the same for all
            # entities in the property_query_set
            extensible_property_type = property_query_set[0].extensible_property_type
            extensible_prop_type_value_field = extensible_property_type.get_value_field()
            values = property_query_set.all().values(extensible_prop_type_value_field)
            return ([x[extensible_prop_type_value_field] for x in values])
        except IndexError:
            raise DoesNotExist("No property with name: {} found on extensible type: {}".format(property,
                                                                                               extensible_type))

    @staticmethod
    def get_unique_values_of_property(property, extensible_type):
        # TODO: add organization to the filter parameters
        property_query_set = BaseExtensibleService._get_values_qs(property, extensible_type)
        try:
            # Note that this assumes that the property type is the same for all
            # entities in the property_query_set
            extensible_prop_type = property_query_set[0].extensible_property_type
            extensible_prop_type_value_field = extensible_prop_type.get_value_field()
            unique_values = property_query_set\
                .order_by(extensible_prop_type_value_field)\
                .distinct(extensible_prop_type_value_field)
            return {x.value for x in unique_values}
        except IndexError:
            raise DoesNotExist("No property with name: {} found on extensible type: {}".format(property,
                                                                                               extensible_type))
