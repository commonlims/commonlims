from __future__ import absolute_import

__all__ = ['FeatureManager']

from django.conf import settings

from .base import Feature
from .exceptions import FeatureNotRegistered


class FeatureManager(object):
    def __init__(self):
        self._registry = {}

    def all(self, feature_type=Feature):
        """
        Get a mapping of feature name -> feature class, optionally specific to a
        particular feature type.
        """
        return {k: v for k, v in self._registry.items() if v == feature_type}

    def add(self, name, cls=Feature):
        """
        Register a feature.

        The passed class is a Feature container object, this object can be used
        to encapsulate the context associated to a feature.

        >>> FeatureManager.has('my:feature', actor=request.user)
        """
        self._registry[name] = cls

    def get(self, name, *args, **kwargs):
        """
        Lookup a registered feature handler given the feature name.

        >>> FeatureManager.get('my:feature', actor=request.user)
        """
        try:
            cls = self._registry[name]
        except KeyError:
            raise FeatureNotRegistered(name)
        return cls(name, *args, **kwargs)

    def has(self, name, *args, **kwargs):
        """
        Determine if a feature is enabled.

        Confiuguration of features is in sentry.conf.server.SENTRY_FEATURES.

        Depending on the Feature class, additional arguments may need to be
        provided to assign organiation or project context to the feature.

        >>> FeatureManager.has('organizations:feature', organization, actor=request.user)
        """
        kwargs.pop('actor', None)
        feature = self.get(name, *args, **kwargs)

        # NOTE: Sentry allowed plugins to take part in the feature mechanism. For simplicity
        # this is not implemented in Common LIMS for now.

        rv = settings.SENTRY_FEATURES.get(feature.name, False)
        if rv is not None:
            return rv

        # Features are by default disabled if no plugin or default enables them
        return False
