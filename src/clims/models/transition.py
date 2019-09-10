from __future__ import absolute_import, print_function
from django.db import models
from sentry.db.models import Model, FlexibleForeignKey
from django.utils import timezone


class Transition(Model):
    """
    Describes a transition from a location to another location
    """
    __core__ = True

    work_batch = models.OneToOneField('clims.WorkBatch')
    source_location = FlexibleForeignKey('clims.Location', related_name='source_transitions')
    target_location = FlexibleForeignKey('clims.Location', related_name='target_transitions')
    performed = models.BooleanField(null=False, default=False)
    created = models.DateTimeField('created', default=timezone.now, db_index=True, null=False)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_transition'
