#!/usr/bin/env python
"""
sentry.utils.runner
~~~~~~~~~~~~~~~~~~~

:copyright: (c) 2012 by the Sentry Team, see AUTHORS for more details.
:license: BSD, see LICENSE for more details.
"""


# Backwards compatibility
from sentry.runner import configure, main  # NOQA

import warnings

warnings.warn("'sentry.utils.runner' has moved to 'sentry.runner'", DeprecationWarning)
