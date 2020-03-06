"""
sentry.tagstore.exceptions
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

:copyright: (c) 2010-2017 by the Sentry Team, see AUTHORS for more details.
:license: BSD, see LICENSE for more details.
"""


class TagKeyNotFound(Exception):
    pass


class TagValueNotFound(Exception):
    pass


class GroupTagKeyNotFound(Exception):
    pass


class GroupTagValueNotFound(Exception):
    pass
