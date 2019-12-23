
from __future__ import absolute_import

from clims.services.extensible import ExtensibleBase
from clims.models import Project, ProjectVersion
from clims.services.wrapper import WrapperMixin
from clims.services.extensible_service_api import ExtensibleServiceAPIMixin
from clims.models import ResultIterator


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

    # TODO-nomerge: Move to base, but before that the base needs to have an abstract _to_wrapper and _archetype (perhaps set to none)
    def iter_versions(self):
        """
        Iterate through all versions of this project
        """
        qs = self._archetype.versions.order_by('version')
        return ResultIterator(qs, self._to_wrapper)


class ProjectService(WrapperMixin, ExtensibleServiceAPIMixin, object):

    _archetype_version_model_class = ProjectVersion
    _archetype_model_class = Project
    _archetype_base_class = ProjectBase

    def __init__(self, app):
        self._app = app
