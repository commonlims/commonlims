from __future__ import absolute_import

from django.conf import settings
from django.db import IntegrityError, models, transaction
from django.utils import timezone

from sentry.db.models import (
    BaseManager, BoundedPositiveIntegerField, FlexibleForeignKey, Model, sane_repr
)


class WorkBatchSubscriptionReason(object):
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


class WorkBatchSubscriptionManager(BaseManager):
    def subscribe(self, work_batch, user, reason=WorkBatchSubscriptionReason.unknown):
        """
        Subscribe a user to an issue, but only if the user has not explicitly
        unsubscribed.
        """
        try:
            with transaction.atomic():
                self.create(
                    user=user,
                    work_batch=work_batch,
                    is_active=True,
                    reason=reason,
                )
        except IntegrityError:
            pass

    def subscribe_actor(self, work_batch, actor, reason=WorkBatchSubscriptionReason.unknown):
        from sentry.models import User, Team

        if isinstance(actor, User):
            return self.subscribe(work_batch, actor, reason)
        if isinstance(actor, Team):
            # subscribe the members of the team
            team_users_ids = list(actor.member_set.values_list('user_id', flat=True))
            return self.bulk_subscribe(work_batch, team_users_ids, reason)

        raise NotImplementedError('Unknown actor type: %r' % type(actor))

    def bulk_subscribe(self, work_batch, user_ids, reason=WorkBatchSubscriptionReason.unknown):
        """
        Subscribe a list of user ids to an issue, but only if the users are not explicitly
        unsubscribed.
        """
        user_ids = set(user_ids)

        # 5 retries for race conditions where
        # concurrent subscription attempts cause integrity errors
        for i in range(4, -1, -1):  # 4 3 2 1 0

            existing_subscriptions = set(WorkBatchSubscription.objects.filter(
                user_id__in=user_ids,
                work_batch=work_batch,
            ).values_list('user_id', flat=True))

            subscriptions = [
                WorkBatchSubscription(
                    user_id=user_id,
                    work_batch=work_batch,
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

    def get_participants(self, work_batch):
        """
        Identify all users who are participating with a given issue.
        """
        raise NotImplementedError("Require teams per org")
        from sentry.models import User, UserOptionValue

        users = {
            user.id: user
            for user in
            User.objects.filter(
                sentry_orgmember_set__teams=work_batch.project.teams.all(),
                is_active=True,
            )
        }

        excluded_ids = set()

        subscriptions = {
            subscription.user_id: subscription
            for subscription in
            WorkBatchSubscription.objects.filter(
                work_batch=work_batch,
                user_id__in=list(users.keys()),
            )
        }

        for user_id, subscription in subscriptions.items():
            if not subscription.is_active:
                excluded_ids.add(user_id)

        options = get_user_options(
            'workflow:notifications',
            list(users.keys()),
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
                results[user] = WorkBatchSubscriptionReason.implicit

        return results


class WorkBatchSubscription(Model):
    """
    Identifies a subscription relationship between a user and an issue.
    """
    __core__ = False

    work_batch = FlexibleForeignKey('clims.WorkBatch', related_name="subscription_set")
    # namespace related_name on User since we don't own the model
    user = FlexibleForeignKey(settings.AUTH_USER_MODEL)
    is_active = models.BooleanField(default=True)
    reason = BoundedPositiveIntegerField(
        default=WorkBatchSubscriptionReason.unknown,
    )
    date_added = models.DateTimeField(default=timezone.now, null=True)

    objects = WorkBatchSubscriptionManager()

    class Meta:
        app_label = 'clims'
        db_table = 'clims_workbatchsubscription'
        unique_together = (('work_batch', 'user'), )

    __repr__ = sane_repr('work_batch_id', 'user_id')
