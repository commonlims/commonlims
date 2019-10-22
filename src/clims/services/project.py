
from __future__ import absolute_import

from clims.services.extensible import ExtensibleBase
from clims.models import Project, ProjectVersion


class ProjectService(object):

    def __init__(self, app):
        self._app = app

    def to_wrapper(self, model):
        if isinstance(model, ProjectVersion):
            return self.project_version_to_wrapper(model)
        elif isinstance(model, Project):
            return self.project_to_wrapper(model)

    def project_version_to_wrapper(self, project_version):
        from clims.services.extensible import ExtensibleTypeNotRegistered

        try:
            SpecificExtensibleType = self._app.extensibles.get_implementation(
                project_version.archetype.extensible_type.name)
            return SpecificExtensibleType(_wrapped_version=project_version, _app=self._app)
        except ExtensibleTypeNotRegistered:
            # This is an unregistered instance. This can happen for example when we have
            # an instance that used to be registered but the Python version has been removed
            # or rename.
            # We must use the base class to wrap it:
            return ProjectBase(_wrapped_version=project_version, _unregistered=True)

    def project_to_wrapper(self, project):
        versioned = project.versions.get(latest=True)
        return self.project_version_to_wrapper(versioned)


class ProjectBase(ExtensibleBase):
    WrappedArchetype = Project
    WrappedVersion = ProjectVersion

    def __init__(self, **kwargs):
        super(ProjectBase, self).__init__(**kwargs)

    def _to_wrapper(self, model):
        """
        Wraps either a SubstanceVersion or Substance as a higher-level object
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
