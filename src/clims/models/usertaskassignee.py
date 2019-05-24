"""
clims.models.usertaskassignee

sentry.models.groupassignee
~~~~~~~~~~~~~~~~~~~~~~~~~~~
:copyright: (c) 2010-2014 by the Sentry Team, see AUTHORS for more details.
:license: BSD, see LICENSE for more details.
"""
from __future__ import absolute_import
import six

from django.conf import settings
from django.db import models
from django.utils import timezone

from sentry.db.models import FlexibleForeignKey, Model, sane_repr, \
    BaseManager
from sentry.models.activity import Activity
from sentry.signals import issue_assigned
from sentry.utils import metrics


class UserTaskAssigneeManager(BaseManager):
    def assign(self, user_task, assigned_to, acting_user=None):
        from sentry.models import User, Team
        from clims.models import UserTaskSubscription, UserTaskSubscriptionReason

        UserTaskSubscription.objects.subscribe_actor(
            user_task=user_task,
            actor=assigned_to,
            reason=UserTaskSubscriptionReason.assigned,
        )

        if isinstance(assigned_to, User):
            assignee_type = 'user'
            other_type = 'team'
        elif isinstance(assigned_to, Team):
            assignee_type = 'team'
            other_type = 'user'
        else:
            raise AssertionError('Invalid type to assign to: %r' % type(assigned_to))

        now = timezone.now()
        assignee, created = UserTaskAssignee.objects.get_or_create(
            user_task=user_task,
            defaults={
                assignee_type: assigned_to,
                'date_added': now,
            }
        )

        if not created:
            affected = UserTaskAssignee.objects.filter(
                user_task=user_task,
            ).exclude(**{
                assignee_type: assigned_to,
            }).update(**{
                assignee_type: assigned_to,
                other_type: None,
                'date_added': now,
            })
        else:
            affected = True
            issue_assigned.send_robust(
                user_task=user_task,
                user=acting_user,
                sender=self.__class__)

        if affected:
            activity = Activity.objects.create(
                user_task=user_task,
                type=Activity.ASSIGNED,
                user=acting_user,
                data={
                    'assignee': six.text_type(assigned_to.id),
                    'assigneeEmail': getattr(assigned_to, 'email', None),
                    'assigneeType': assignee_type,
                },
            )
            activity.send_notification()
            # TODO: Look into this
            metrics.incr('user_task.assignee.change', instance='assigned', skip_internal=True)

    def deassign(self, user_task, acting_user=None):
        affected = UserTaskAssignee.objects.filter(
            user_task=user_task,
        )[:1].count()
        UserTaskAssignee.objects.filter(
            user_task=user_task,
        ).delete()

        if affected > 0:
            activity = Activity.objects.create(
                user_task=user_task,
                type=Activity.UNASSIGNED,
                user=acting_user,
            )
            activity.send_notification()
            metrics.incr('user_task.assignee.change', instance='deassigned', skip_internal=True)


class UserTaskAssignee(Model):
    """
    Identifies an assignment relationship between a user/team and an
    aggregated event (Group).
    """
    __core__ = False

    objects = UserTaskAssigneeManager()

    organization = FlexibleForeignKey('sentry.Organization', related_name="assignee_set")
    user_task = FlexibleForeignKey('clims.UserTask', related_name="assignee_set", unique=True)
    user = FlexibleForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sentry_assignee_set",
        null=True)
    team = FlexibleForeignKey(
        'sentry.Team',
        related_name="sentry_assignee_set",
        null=True)
    date_added = models.DateTimeField(default=timezone.now)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_usertaskasignee'

    __repr__ = sane_repr('user_task_id', 'user_id', 'team_id')

    def save(self, *args, **kwargs):
        assert (
            not (self.user_id is not None and self.team_id is not None) and
            not (self.user_id is None and self.team_id is None)
        ), 'Must have Team or User, not both'
        super(UserTaskAssignee, self).save(*args, **kwargs)

    def assigned_actor_id(self):
        if self.user:
            return u"user:{}".format(self.user_id)

        if self.team:
            return u"team:{}".format(self.team_id)

        raise NotImplementedError("Unkown Assignee")

    def assigned_actor(self):
        from sentry.api.fields.actor import Actor

        return Actor.from_actor_id(self.assigned_actor_id())
