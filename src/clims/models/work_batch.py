from __future__ import absolute_import, print_function
from django.db import models
from sentry.db.models import Model, FlexibleForeignKey, BoundedPositiveIntegerField
from django.db.models.fields import TextField
from django.utils.translation import ugettext_lazy as _


class WorkBatchStatus(object):
    UNRESOLVED = 0
    RESOLVED = 1
    IGNORED = 2
    PENDING_DELETION = 3
    DELETION_IN_PROGRESS = 4


class WorkBatch(Model):
    """
    Represents a task that needs to be fulfilled by a user. May involve several steps
    and views to be fully processed.
    """
    __core__ = True

    name = models.CharField('name', max_length=200, blank=True)
    organization = FlexibleForeignKey('sentry.Organization')

    # plugin = FlexibleForeignKey('clims.PluginRegistration', null=True)
    handler = models.TextField('handler')

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    # TODO: Remove
    extra_fields = TextField('extra_fields')

    num_comments = BoundedPositiveIntegerField(default=0, null=True)

    status = BoundedPositiveIntegerField(default=0,
                                         choices=(
                                             (WorkBatchStatus.UNRESOLVED,
                                              _('Unresolved')),
                                             (WorkBatchStatus.RESOLVED,
                                              _('Resolved')),
                                             (WorkBatchStatus.IGNORED,
                                              _('Ignored')),
                                         ),
                                         db_index=True)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_workbatch'
