from __future__ import absolute_import, print_function

from django.db import models
from sentry.db.models import (Model, FlexibleForeignKey, sane_repr)

# TODO: We need latest django for this! Using a TextField for the POC
# from django.contrib.postgres.fields import JsonField


class Sample(Model):
    """
    Either an original sample or an aliquot.
    """
    __core__ = True

    # users can generate tokens without being application-bound
    project = FlexibleForeignKey('sentry.Project', null=True, related_name="samples")
    name = models.TextField(null=True)
    type = models.TextField(null=True)
    concentration = models.IntegerField(null=True)
    volume = models.IntegerField(null=True)
    custom_fields = models.TextField(null=True)
    depth = models.IntegerField()

    class Meta:
        app_label = 'sentry'
        db_table = 'sentry_sample'
        unique_together = (('project', 'name'), )

    __repr__ = sane_repr('project_id', 'name')


class SampleBatch(Model):
    __core__ = True  # TODO: how is this used?
    pass
