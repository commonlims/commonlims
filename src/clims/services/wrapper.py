from __future__ import absolute_import


class WrapperMixin(object):
    """
    This mixin can be used to provide wrapping methods to a service class which
    handles translating models of `ExtensibleModel` to their specific `ExtensibleBase`
    implementations.
    The implementing class needs to provide `_archetype_version_class`, `_archetype_class`, and
    `_archetype_base_class`.
    """

    _archetype_version_class = None
    _archetype_class = None
    _archetype_base_class = None

    def to_wrapper(self, model):
        if isinstance(model, self._archetype_version_class):
            return self._version_to_wrapper(model)
        elif isinstance(model, self._archetype_class):
            return self._archetype_to_wrapper(model)

    def _version_to_wrapper(self, version):
        from clims.services.extensible import ExtensibleTypeNotRegistered

        try:
            SpecificExtensibleType = self._app.extensibles.get_implementation(
                version.archetype.extensible_type.name)
            return SpecificExtensibleType(_wrapped_version=version, _app=self._app)
        except ExtensibleTypeNotRegistered:
            return self._archetype_base_class(_wrapped_version=version, _unregistered=True)

    def _archetype_to_wrapper(self, archetype):
        versioned = archetype.versions.get(latest=True)
        return self._version_to_wrapper(versioned)