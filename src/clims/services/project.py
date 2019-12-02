
from __future__ import absolute_import

from clims.services.extensible import ExtensibleBase
from clims.models import Project, ProjectVersion
from clims.services.wrapper import WrapperMixin
from clims.services.extensible_service_api import ExtensibleServiceAPIMixin


class ProjectBase(ExtensibleBase):
    WrappedArchetype = Project
    WrappedVersion = ProjectVersion

    def __init__(self, **kwargs):
        super(ProjectBase, self).__init__(**kwargs)

    def _to_wrapper(self, model):
        """
        Wraps either a ProjectVersion or Project as a higher-level object
        """
        return self._app.projects.to_wrapper(model)

    @property
    def version(self):
        return self._wrapped_version.version

    @property
    def organization(self):
        return self._archetype.organization

    @property
    def extensible_type(self):
        return self._archetype.extensible_type

    def iter_versions(self):
        """
        Iterate through all versions of this project
        """
        for version in self._archetype.versions.order_by('version'):
            yield self._to_wrapper(version)


class ProjectService(WrapperMixin, ExtensibleServiceAPIMixin, object):

    _archetype_version_class = ProjectVersion
    _archetype_class = Project
    _archetype_base_class = ProjectBase

    def __init__(self, app):
        self._app = app

    def _search_qs(self, query):
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

        if key == "project.name":
            # TODO: the search parameter indicates we're looking for a substance that's a sample
            # so add a category or similar so it doesn't find other things that are in a container.
            return ProjectVersion.objects.filter(
                latest=True, name__icontains=val).prefetch_related('properties')
        elif key == "sample.type":
            pass
        else:
            raise NotImplementedError("The key {} is not implemented".format(key))
