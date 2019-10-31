from __future__ import absolute_import


class ExtensibleServiceAPIMixin(object):

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

    def filter(self, **kwargs):
        get_args = self._get_filter_arguments(**kwargs)
        models = self._archetype_version_class.objects.\
            prefetch_related('properties__extensible_property_type').\
            filter(**get_args)
        return [self.to_wrapper(m) for m in models]

    def get(self, **kwargs):
        get_args = self._get_filter_arguments(**kwargs)
        model = self._archetype_version_class.objects.\
            prefetch_related('properties__extensible_property_type').\
            get(**get_args)
        return self.to_wrapper(model)

    def _get_filter_arguments(self, **kwargs):
        get_args = {}
        if 'latest' not in get_args.keys():
            get_args['latest'] = True
        for key, value in kwargs.items():
            if key == 'project':
                get_args['archetype__project__name'] = value.name
            elif key == 'project_name':
                get_args['archetype__project__name'] = value
            elif not key == 'latest':
                get_args['archetype__{}'.format(key)] = value
        return get_args
