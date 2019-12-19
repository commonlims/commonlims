from __future__ import absolute_import

import six
from django.db.models import Prefetch
from django.core import exceptions as django_exceptions
from clims.services.exceptions import DoesNotExist
from clims.models.extensible import ExtensibleProperty


class ExtensibleServiceAPIMixin(object):

    DoesNotExist = DoesNotExist

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
        get_args = self._get_filter_arguments(**kwargs)
        models = self._archetype_version_class.objects.prefetch_related(
            Prefetch('properties', to_attr='all_properties'),
            Prefetch('all_properties__extensible_property_type')).\
            filter(**get_args)
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

    def _get_values_qs(self, property, extensible_type):
        extensible_type_name = extensible_type.type_full_name_cls()
        property_query_set = ExtensibleProperty.objects.filter(
            extensible_property_type__extensible_type__name=extensible_type_name,
            extensible_property_type__name=property).select_related('extensible_property_type')
        return property_query_set

    def get_values_of_property(self, property, extensible_type):
        property_query_set = self._get_values_qs(property, extensible_type)
        extensible_type = property_query_set[0].extensible_property_type
        extensible_type_value_field = extensible_type.get_value_field()
        values = property_query_set.all().values(extensible_type_value_field)
        return ([x[extensible_type_value_field] for x in values])

    def get_unique_values_of_property(self, property, extensible_type):
        # TODO: add organization to the filter parameters
        property_query_set = self._get_values_qs(property, extensible_type)
        extensible_type = property_query_set[0].extensible_property_type
        extensible_type_value_field = extensible_type.get_value_field()
        unique_values = property_query_set.order_by(extensible_type_value_field).distinct(extensible_type_value_field)
        return set([x.value for x in unique_values])
