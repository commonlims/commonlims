from __future__ import absolute_import

from datetime import timedelta
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response

from sentry.api.base import DocSection
from clims.api.bases.user_task import UserTaskBaseEndpoint
from sentry.api.serializers import serialize
from sentry.api.serializers.rest_framework.group_notes import NoteSerializer, seperate_resolved_actors

from sentry.api.fields.actor import Actor

from sentry.models import (
    Activity, GroupSubscription, GroupSubscriptionReason, User
)
from sentry.utils.functional import extract_lazy_object


class UserTaskNotesEndpoint(UserTaskBaseEndpoint):
    doc_section = DocSection.EVENTS

    def get(self, request, user_task_id):
        notes = Activity.objects.filter(
            user_task_id=user_task_id,
            type=Activity.NOTE,
        ).select_related('user')

        return self.paginate(
            request=request,
            queryset=notes,
            # TODO(dcramer): we want to sort by datetime
            order_by='-id',
            on_results=lambda x: serialize(x, request.user),
        )

    def post(self, request, user_task_id):
        serializer = NoteSerializer(data=request.DATA, context={'user_task': user_task_id})

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = dict(serializer.object)

        mentions = data.pop('mentions', [])

        if Activity.objects.filter(
            user_task_id=user_task_id,
            type=Activity.NOTE,
            user=request.user,
            data=data,  # TODO: Hash instead?
            datetime__gte=timezone.now() - timedelta(hours=1)
        ).exists():
            return Response(
                '{"detail": "You have already posted that comment."}',
                status=status.HTTP_400_BAD_REQUEST
            )

        actors = Actor.resolve_many(mentions)
        actor_mentions = seperate_resolved_actors(actors)

        for user in actor_mentions.get('users'):
            GroupSubscription.objects.subscribe(
                group=1,
                user=user,
                reason=GroupSubscriptionReason.mentioned,
            )

        mentioned_teams = actor_mentions.get('teams')

        mentioned_team_users = list(
            User.objects.filter(
                sentry_orgmember_set__organization_id=1,
                sentry_orgmember_set__organizationmemberteam__team__in=mentioned_teams,
                sentry_orgmember_set__organizationmemberteam__is_active=True,
                is_active=True,
            ).exclude(id__in={u.id for u in actor_mentions.get('users')})
            .values_list('id', flat=True)
        )

        # TODO!
        # GroupSubscription.objects.bulk_subscribe(
        #     group=1,
        #     user_ids=mentioned_team_users,
        #     reason=GroupSubscriptionReason.team_mentioned,
        # )

        # TODO: Org id!
        activity = Activity.objects.create(
            user_task_id=user_task_id,
            type=Activity.NOTE,
            user=extract_lazy_object(request.user),
            data=data,
            project_id=1,  # TODO: should not be required
        )

        activity.send_notification()

        return Response(serialize(activity, request.user), status=201)
