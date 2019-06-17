from __future__ import absolute_import
from sentry.plugins2 import file_handlers_registry


def handles_submitted_samples(func):
    file_handlers_registry.register(func)
    return func
