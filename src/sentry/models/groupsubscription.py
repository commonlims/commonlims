from __future__ import absolute_import

from django.conf import settings
from django.db import IntegrityError, models, transaction
from django.db.models import Q
from django.utils import timezone

from sentry.db.models import (
    BaseManager, BoundedPositiveIntegerField, FlexibleForeignKey, Model, sane_repr
)


class UserTaskSubscriptionReason(object):
    implicit = -1  # not for use as a persisted field value
    committed = -2  # not for use as a persisted field value
    processing_issue = -3  # not for use as a persisted field value

    unknown = 0
    comment = 1
    assigned = 2
    bookmark = 3
    status_change = 4
    deploy_setting = 5
    mentioned = 6
    team_mentioned = 7

    descriptions = {
        implicit:
        u"have opted to receive updates for all issues within "
        "projects that you are a member of",
        committed:
        u"were involved in a commit that is part of this release",
        processing_issue:
        u"are subscribed to alerts for this project",
        comment:
        u"have commented on this issue",
        assigned:
        u"have been assigned to this issue",
        bookmark:
        u"have bookmarked this issue",
        status_change:
        u"have changed the resolution status of this issue",
        deploy_setting:
        u"opted to receive all deploy notifications for this organization",
        mentioned:
        u"have been mentioned in this issue",
        team_mentioned:
        u"are a member of a team mentioned in this issue",
    }


def get_user_options(key, user_ids, default):
    raise NotImplementedError("Remove project relation")
    from sentry.models import UserOption

    options = {
        (option.user_id, option.project_id): option.value
        for option in
        UserOption.objects.filter(
            Q(project__isnull=True) | Q(project=project),
            user_id__in=user_ids,
            key='workflow:notifications',
        )
    }

    results = {}

    for user_id in user_ids:
        results[user_id] = options.get(
            (user_id, project.id),
            options.get(
                (user_id, None),
                default,
            ),
        )

    return results


class UserTaskSubscriptionManager(BaseManager):
    def subscribe(self, user_task, user, reason=UserTaskSubscriptionReason.unknown):
        """
        Subscribe a user to an issue, but only if the user has not explicitly
        unsubscribed.
        """
        try:
            with transaction.atomic():
                self.create(
                    user=user,
                    user_task=user_task,
                    is_active=True,
                    reason=reason,
                )
        except IntegrityError:
            pass

    def subscribe_actor(self, user_task, actor, reason=UserTaskSubscriptionReason.unknown):
        from sentry.models import User, Team

        if isinstance(actor, User):
            return self.subscribe(user_task, actor, reason)
        if isinstance(actor, Team):
            # subscribe the members of the team
            team_users_ids = list(actor.member_set.values_list('user_id', flat=True))
            return self.bulk_subscribe(user_task, team_users_ids, reason)

        raise NotImplementedError('Unknown actor type: %r' % type(actor))

    def bulk_subscribe(self, user_task, user_ids, reason=UserTaskSubscriptionReason.unknown):
        """
        Subscribe a list of user ids to an issue, but only if the users are not explicitly
        unsubscribed.
        """
        user_ids = set(user_ids)

        # 5 retries for race conditions where
        # concurrent subscription attempts cause integrity errors
        for i in range(4, -1, -1):  # 4 3 2 1 0

            existing_subscriptions = set(UserTaskSubscription.objects.filter(
                user_id__in=user_ids,
                user_task=user_task,
            ).values_list('user_id', flat=True))

            subscriptions = [
                UserTaskSubscription(
                    user_id=user_id,
                    user_task=user_task,
                    is_active=True,
                    reason=reason,
                )
                for user_id in user_ids
                if user_id not in existing_subscriptions
            ]

            try:
                with transaction.atomic():
                    self.bulk_create(subscriptions)
                    return True
            except IntegrityError as e:
                if i == 0:
                    raise e

    def get_participants(self, user_task):
        """
        Identify all users who are participating with a given issue.
        """
        raise NotImplementedError("Require teams per org")
        from sentry.models import User, UserOptionValue

        users = {
            user.id: user
            for user in
            User.objects.filter(
                sentry_orgmember_set__teams=user_task.project.teams.all(),
                is_active=True,
            )
        }

        excluded_ids = set()

        subscriptions = {
            subscription.user_id: subscription
            for subscription in
            UserTaskSubscription.objects.filter(
                user_task=user_task,
                user_id__in=users.keys(),
            )
        }

        for user_id, subscription in subscriptions.items():
            if not subscription.is_active:
                excluded_ids.add(user_id)

        options = get_user_options(
            'workflow:notifications',
            users.keys(),
            UserOptionValue.all_conversations,
        )

        for user_id, option in options.items():
            if option == UserOptionValue.no_conversations:
                excluded_ids.add(user_id)
            elif option == UserOptionValue.participating_only:
                if user_id not in subscriptions:
                    excluded_ids.add(user_id)

        results = {}

        for user_id, user in users.items():
            if user_id in excluded_ids:
                continue

            subscription = subscriptions.get(user_id)
            if subscription is not None:
                results[user] = subscription.reason
            else:
                results[user] = UserTaskSubscriptionReason.implicit

        return results


class UserTaskSubscription(Model):
    """
    Identifies a subscription relationship between a user and an issue.
    """
    __core__ = False

    user_task = FlexibleForeignKey('sentry.UserTask', related_name="subscription_set")
    # namespace related_name on User since we don't own the model
    user = FlexibleForeignKey(settings.AUTH_USER_MODEL)
    is_active = models.BooleanField(default=True)
    reason = BoundedPositiveIntegerField(
        default=UserTaskSubscriptionReason.unknown,
    )
    date_added = models.DateTimeField(default=timezone.now, null=True)

    objects = UserTaskSubscriptionManager()

    class Meta:
        app_label = 'sentry'
        db_table = 'sentry_usertasksubscription'
        unique_together = (('user_task', 'user'), )

    __repr__ = sane_repr('user_task_id', 'user_id')
