from __future__ import absolute_import

from rest_framework.response import Response
from sentry.api.bases.user_task import UserTaskBaseEndpoint
from sentry.api.bases.organization import OrganizationEndpoint
from clims.models import UserTask
from sentry.models.activity import Activity
from sentry.api.serializers import serialize
from sentry.api.paginator import OffsetPaginator


class UserTaskEndpoint(OrganizationEndpoint):

    def get(self, request, organization):
        user_tasks = UserTask.objects.filter(organization=organization)
        return self.paginate(
            request=request,
            queryset=user_tasks,
            paginator_cls=OffsetPaginator,
            on_results=lambda x: serialize(x),
        )


class UserTaskDetailsEndpoint(UserTaskBaseEndpoint):
    def get(self, request, user_task_id):
        user_task = UserTask.objects.get(pk=user_task_id)
        return Response(serialize(user_task), status=200)

# TODO This appears to be unused. Can I remove it? /JD 2019-05-29


class UserTaskDetailsActivityEndpoint(UserTaskBaseEndpoint):
    def get(self, request, user_task_id):
        return Response("", 200)

        user_task = UserTask.objects.get(pk=user_task_id)

        activity = Activity.objects.filter(
            user_task=user_task,
        ).order_by('-datetime').select_related('user')

        return self.paginate(
            request=request,
            queryset=activity,
            paginator_cls=OffsetPaginator,
            on_results=lambda x: serialize(x))
