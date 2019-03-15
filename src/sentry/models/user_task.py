from __future__ import absolute_import, print_function
from django.db import models
from sentry.db.models import Model, FlexibleForeignKey, BoundedPositiveIntegerField
from django.db.models.fields import TextField
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _


class SampleBatch(Model):
    __core__ = True

    class Meta:
        app_label = 'clims'
        db_table = 'clims_samplebatch'


class UserTaskStatus(object):
    UNRESOLVED = 0
    RESOLVED = 1
    IGNORED = 2
    PENDING_DELETION = 3
    DELETION_IN_PROGRESS = 4


class UserTask(Model):
    """
    Represents a task that needs to be fulfilled by a user. May involve several steps
    and views to be fully processed.
    """
    __core__ = True

    # All user tasks can have one or more sample batch
    name = models.CharField('name', max_length=200, blank=True)
    organization = FlexibleForeignKey('sentry.Organization')
    handler = models.TextField('handler')
    created = models.DateTimeField('created', default=timezone.now, db_index=True, null=False)

    # TODO: This should be jsonb. That waits for the django/py3 upgrade (before 1.0)
    extra_fields = TextField('extra_fields')

    num_comments = BoundedPositiveIntegerField(default=0, null=True)

    status = BoundedPositiveIntegerField(
        default=0,
        choices=(
            (UserTaskStatus.UNRESOLVED, _('Unresolved')),
            (UserTaskStatus.RESOLVED, _('Resolved')),
            (UserTaskStatus.IGNORED, _('Ignored')),
        ),
        db_index=True
    )

    class Meta:
        app_label = 'sentry'
        db_table = 'sentry_usertask'
