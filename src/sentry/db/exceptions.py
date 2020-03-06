"""
sentry.db.exceptions
~~~~~~~~~~~~~~~~~~~~

:copyright: (c) 2010-2014 by the Sentry Team, see AUTHORS for more details.
:license: BSD, see LICENSE for more details.
"""


class QueryError(Exception):
    pass


class CannotResolveExpression(Exception):
    pass
