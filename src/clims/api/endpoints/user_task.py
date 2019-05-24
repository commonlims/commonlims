from __future__ import absolute_import

from rest_framework.response import Response
from clims.api.bases.user_task import UserTaskBaseEndpoint
from sentry.api.bases.organization import OrganizationEndpoint
from clims.models import UserTask
from clims.api.serializers.models.usertask import UserTaskSerializer
from sentry.models.activity import Activity
from sentry.api.paginator import OffsetPaginator


class UserTaskEndpoint(OrganizationEndpoint):

    def get(self, request, organization):
        user_tasks = UserTask.objects.filter(organization=organization)
        return self.paginate(
            request=request,
            queryset=user_tasks,
            paginator_cls=OffsetPaginator,
            on_results=lambda x: UserTaskSerializer(x, many=True).data,
        )


class UserTaskDetailsEndpoint(UserTaskBaseEndpoint):
    def get(self, request, user_task_id):
        user_task = UserTask.objects.get(pk=user_task_id)
        return Response(UserTaskSerializer(user_task).data, status=200)


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
            on_results=lambda x: UserTaskSerializer(x, many=True).data)
