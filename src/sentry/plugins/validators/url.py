from __future__ import absolute_import

from sentry.exceptions import PluginError


def URLValidator(value, **kwargs):
    from sentry.http import is_valid_url  # Django 1.9 setup issue
    if not value.startswith(('http://', 'https://')):
        raise PluginError('Not a valid URL.')
    if not is_valid_url(value):
        raise PluginError('Not a valid URL.')
    return value
