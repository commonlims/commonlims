from __future__ import absolute_import

from django.db import models
from sentry.db.models import (Model, FlexibleForeignKey, sane_repr)


class TransitionType(object):
    MOVE = 0
    SPAWN = 1


class Transition(Model):
    """
    Represents a Transition for a Substance.
    """
    __core__ = True

    BACKEND_CAMUNDA = 'camunda'

    # Added because it seems to be used in all CLIMS models.
    # TODO: check if it is actually needed?
    organization = FlexibleForeignKey('sentry.Organization')

    # Added in case we want to be able to audit a user's history directly.
    user = FlexibleForeignKey('sentry.User', related_name='transitions')

    # The work batch in which this transition was created, if it was created in a work batch context.
    # TODO: should we disallow nulls here? Are transitions ever created outside a work batch context?
    work_batch = FlexibleForeignKey('WorkBatch', null=True, related_name='transitions')

    source_location = FlexibleForeignKey('SubstanceLocation', related_name='source_transitions')
    target_location = FlexibleForeignKey('SubstanceLocation', related_name='target_transitions')
    source_substance = FlexibleForeignKey('Substance', related_name='source_transitions')
    target_substance = FlexibleForeignKey('Substance', related_name='target_transitions')

    transition_type = models.IntegerField(default=TransitionType.MOVE)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_transition'

    __repr__ = sane_repr('work_batch_id', 'source_location_id', 'source_substance_id', 'target_location_id', 'target_substance_id')
