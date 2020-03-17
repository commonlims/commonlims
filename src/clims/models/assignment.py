from __future__ import absolute_import

from django.db import models
from sentry.db.models import (FlexibleForeignKey, sane_repr)
from jsonfield import JSONField


class SubstanceAssignment(models.Model):
    """
    Represents an assignment of a substance to a process.

    Note that this model only represents assignments by humans to a process. The process engine
    will moves the entity around after this assignment without it being logged here.
    """

    STATUS_NONE = 0

    # A request is about to be sent to the external workflow engine
    STATUS_REQUESTING = 1

    # A request has been delivered to the external workflow engine. The execution is now under
    # the workflow engine's control
    STATUS_DELIVERED = 2

    __core__ = True

    substance = FlexibleForeignKey('clims.Substance', related_name="assignments")

    user = FlexibleForeignKey('sentry.User')

    workflow = FlexibleForeignKey('clims.Workflow', null=True)

    # The preset of variables used when assigning
    preset = models.TextField()

    variables = JSONField()

    status = models.IntegerField(default=STATUS_NONE)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_substanceassignment'

    __repr__ = sane_repr('substance', 'workflow', 'preset')
