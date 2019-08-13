from __future__ import absolute_import


from django.db import models
from sentry.db.models import (Model, FlexibleForeignKey, sane_repr)


class ExtensibleInstance(Model):
    __core__ = True

    name = models.TextField(null=False)
    type = FlexibleForeignKey('clims.ExtensibleType', null=False)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_extensibleinstance'

    __repr__ = sane_repr('name')
