from __future__ import absolute_import

import os
import sys
import pytest

pytest_plugins = [
    'sentry.utils.pytest'
]

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# I'm 99.9% sure there is a plugin for easily skipping based on patterns from a file
# (or that it's supported in the core) but I didn't find it right away, so:

if os.path.exists(".skiptests"):
    with open(".skiptests") as f:
        # Extra skips should be of the format <class_name>.<function_name>, as that
        # is the format pytest reports by default in the failure report
        extra_skips = {line.strip() for line in f.readlines()}
else:
    extra_skips = {}


def pytest_configure(config):
    import warnings
    # XXX(dramer): Kombu throws a warning due to transaction.commit_manually
    # being used
    warnings.filterwarnings('error', '', Warning, r'^(?!(|kombu|raven|sentry))')


def pytest_collection_modifyitems(session, config, items):
    for item in items:
        try:
            cls_and_name = "{}.{}".format(item.cls.__name__, item.name)
            if cls_and_name in extra_skips:
                mark = pytest.mark.skip(reason="Is in .skiptests...")
                item.add_marker(mark)
        except AttributeError:
            pass
