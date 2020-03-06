"""
sentry.rules.conditions.regression_event
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

:copyright: (c) 2010-2014 by the Sentry Team, see AUTHORS for more details.
:license: BSD, see LICENSE for more details.
"""



from sentry.rules.conditions.base import EventCondition


class RegressionEventCondition(EventCondition):
    label = 'An issue changes state from resolved to unresolved'

    def passes(self, event, state):
        return state.is_regression
