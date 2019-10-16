from __future__ import absolute_import

from clims.services.extensible import ExtensibleBase
from clims.models import Container, ContainerVersion


class ContainerService(object):
    def __init__(self, app):
        self._app = app

    # TODO: Some code-copying form SubstanceService
    def to_wrapper(self, model):
        if isinstance(model, ContainerVersion):
            return self.container_version_to_wrapper(model)
        elif isinstance(model, Container):
            return self.container_to_wrapper(model)

    def container_version_to_wrapper(self, container_version):
        from clims.services.extensible import ExtensibleTypeNotRegistered

        try:
            SpecificExtensibleType = self._app.extensibles.get_implementation(
                container_version.archetype.extensible_type.name)
            return SpecificExtensibleType(_wrapped_version=container_version, _app=self._app)
        except ExtensibleTypeNotRegistered:
            return ContainerBase(_wrapped_version=container_version, _unregistered=True)

    def container_to_wrapper(self, container, version=None):
        if version is not None:
            versioned = container.versions.get(version=version)
        else:
            versioned = container.versions.get(latest=True)
        return self.container_version_to_wrapper(versioned)


class ContainerBase(ExtensibleBase):
    """
    A base object for defining custom containers.

    Details:

    Under the hood, this object wraps a Container object and its related Extensible* classes.
    """

    WrappedArchetype = Container
    WrappedVersion = ContainerVersion

    def __init__(self, **kwargs):
        super(ContainerBase, self).__init__(**kwargs)
        self._has_ancestry = False
