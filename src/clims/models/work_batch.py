from __future__ import absolute_import, print_function
from django.db import models
from sentry.db.models import FlexibleForeignKey, BoundedPositiveIntegerField, sane_repr
from django.db.models.fields import TextField
from django.utils.translation import ugettext_lazy as _
from clims.models.extensible import ExtensibleModel, ExtensibleVersion
from clims.models.container import Container


class WorkBatchStatus(object):
    UNRESOLVED = 0
    RESOLVED = 1
    IGNORED = 2
    PENDING_DELETION = 3
    DELETION_IN_PROGRESS = 4


class WorkBatch(ExtensibleModel):
    """
    Represents a task that needs to be fulfilled by a user. May involve several steps
    and views to be fully processed.
    """

    def __init__(self, *args, **kwargs):
        super(WorkBatch, self).__init__(*args, **kwargs)

    __core__ = True

    name = models.CharField('name', max_length=200, blank=True)
    organization = FlexibleForeignKey('sentry.Organization')

    handler = models.TextField('handler')

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

    input_containers = models.ManyToManyField(Container)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_workbatch'


class WorkBatchVersion(ExtensibleVersion):
    __core__ = True

    archetype = models.ForeignKey("clims.WorkBatch", related_name='versions')

    __repr__ = sane_repr('workbatch_id', 'version', 'latest')
