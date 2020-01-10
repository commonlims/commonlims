
from __future__ import absolute_import

from clims.services.extensible import ExtensibleBase
from clims.models import Project, ProjectVersion
from clims.services.base_extensible_service import BaseExtensibleService


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


class ProjectService(BaseExtensibleService):
    def __init__(self, app):
        super(ProjectService, self).__init__(app, ProjectBase)
