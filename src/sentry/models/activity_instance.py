from __future__ import absolute_import

from sentry.db.models import (
    FlexibleForeignKey, Model
)
from django.db.models.fields import TextField


class ActivityInstance(Model):
    __core__ = True

    sample = FlexibleForeignKey('sentry.Sample')
    user_task = FlexibleForeignKey('sentry.UserTask')

    # Maps back to a workflow engine (e.g. Camunda)
    external_id = TextField('sentry.external_id')

    class Meta:
        app_label = 'sentry'
        db_table = 'sentry_activityinstance'
