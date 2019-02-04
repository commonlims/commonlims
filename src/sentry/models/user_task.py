from __future__ import absolute_import, print_function
from django.db import models
from sentry.db.models import (
    FlexibleForeignKey, Model,
)


class SampleBatch(Model):
    __core__ = True

    class Meta:
        app_label = 'clims'
        db_table = 'clims_samplebatch'


class UserTask(Model):
    """
    Represents a task that needs to be fulfilled by a user. May involve several steps
    and views to be fully processed.
    """
    __core__ = True

    # All user tasks can have one or more sample batch
    name = models.CharField('name', max_length=200, blank=True)
    sample_batch = FlexibleForeignKey('clims.SampleBatch')

    class Meta:
        app_label = 'clims'
        db_table = 'clims_usertask'
