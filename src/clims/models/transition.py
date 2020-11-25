from __future__ import absolute_import

from django.db import models
from sentry.db.models import (Model, FlexibleForeignKey, sane_repr)


class TransitionType(object):
    MOVE = 0
    SPAWN = 1

    @classmethod
    def valid(cls, tt):
        return tt == cls.MOVE or tt == cls.SPAWN


class Transition(Model):
    """
    Represents a Transition for a Substance.
    """
    __core__ = True

    # Added in case we want to be able to audit a user's history directly.
    # TODO: null=False
    user = FlexibleForeignKey('sentry.User', related_name='transitions', null=True)

    # The work batch in which this transition was created, if it was created in a work batch context.
    work_batch = FlexibleForeignKey('WorkBatch', null=True, related_name='transitions')

    source_location = FlexibleForeignKey('SubstanceLocation', related_name='source_transitions')
    target_location = FlexibleForeignKey('SubstanceLocation', related_name='target_transitions')

    transition_type = models.IntegerField(default=TransitionType.MOVE)

    created_at = models.DateTimeField(auto_now_add=True)
    # Note that transitions should never be updated. This is provided for consistency
    # and auditing purposes.
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_transition'

    __repr__ = sane_repr('work_batch_id', 'source_location_id', 'target_location_id')
