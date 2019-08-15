from __future__ import absolute_import

from sentry.db.models import (
    FlexibleForeignKey, Model
)
from django.db.models.fields import TextField


class ActivityInstance(Model):
    __core__ = True

    sample = FlexibleForeignKey('clims.Sample')
    work_batch = FlexibleForeignKey('clims.WorkBatch', null=True)  # TODO!

    # Maps back to a workflow engine (e.g. Camunda)
    external_id = TextField()

    class Meta:
        app_label = 'clims'
        db_table = 'clims_activityinstance'
