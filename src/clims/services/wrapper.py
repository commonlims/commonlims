from __future__ import absolute_import


class WrapperMixin(object):
    """
    This mixin can be used to provide wrapping methods to a service class which
    handles translating models of `ExtensibleModel` to their specific `ExtensibleBase`
    implementations.
    The implementing class needs to provide `_archetype_version`, `_archetype`, and
    `_archetype_base`.
    """

    _archetype_version = None
    _archetype = None
    _archetype_base = None

    def to_wrapper(self, model):
        if isinstance(model, self._archetype_version):
            return self._version_to_wrapper(model)
        elif isinstance(model, self._archetype):
            return self._archetype_to_wrapper(model)

    def _version_to_wrapper(self, version):
        from clims.services.extensible import ExtensibleTypeNotRegistered

        try:
            SpecificExtensibleType = self._app.extensibles.get_implementation(
                version.archetype.extensible_type.name)
            return SpecificExtensibleType(_wrapped_version=version, _app=self._app)
        except ExtensibleTypeNotRegistered:
            return self._archetype_base(_wrapped_version=version, _unregistered=True)

    def _archetype_to_wrapper(self, archetype):
        versioned = archetype.versions.get(latest=True)
        return self._version_to_wrapper(versioned)
