"""
sentry.cache.django
~~~~~~~~~~~~~~~~~~~

:copyright: (c) 2010-2014 by the Sentry Team, see AUTHORS for more details.
:license: BSD, see LICENSE for more details.
"""

from django.core.cache import cache

from .base import BaseCache


class DjangoCache(BaseCache):
    def set(self, key, value, timeout, version=None, raw=False):
        cache.set(key, value, timeout, version=version or self.version)

    def delete(self, key, version=None):
        cache.delete(key, version=version or self.version)

    def get(self, key, version=None, raw=False):
        return cache.get(key, version=version or self.version)
