from __future__ import absolute_import, print_function
from django.db import models
from sentry.db.models import Model
from django.db.models.fields import TextField


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

    # TODO: This should be jsonb. That waits for the django/py3 upgrade (before 1.0)
    extra_fields = TextField('extra_fields')

    class Meta:
        app_label = 'sentry'
        db_table = 'sentry_usertask'
