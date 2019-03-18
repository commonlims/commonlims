from __future__ import absolute_import, print_function
from django.db import models
from sentry.db.models import Model, FlexibleForeignKey
from sentry.models.user_task import UserTask


class ResultFile(Model):
    """
    Represents a file shared for all samples in a user task
    File contents is stored directly in db
    """
    __core__ = True

    name = models.CharField('name', max_length=200, blank=True)
    contents = models.TextField('contents')
    user_task = FlexibleForeignKey(UserTask)

    class Meta:
        app_label = 'sentry'
        db_table = 'sentry_result_file'
