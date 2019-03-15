from __future__ import absolute_import

from rest_framework.response import Response
from sentry.api.bases.user_task import UserTaskBaseEndpoint
from sentry.api.bases import OrganizationEndpoint
from sentry.models import UserTask
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

    def post(self, request):
        return Response([], status=201)


class UserTaskDetailsEndpoint(UserTaskBaseEndpoint):

    def _get_activity(self, request, user_task, num):
        activity_items = set()
        activity = []
        activity_qs = Activity.objects.filter(
            user_task=user_task,
        ).order_by('-datetime').select_related('user')
        # we select excess so we can filter dupes
        for item in activity_qs[:num * 2]:
            sig = (item.type, item.ident, item.user_id)
            # TODO: we could just generate a signature (hash(text)) for notes
            # so there's no special casing
            if item.type == Activity.NOTE:
                activity.append(item)
            elif sig not in activity_items:
                activity_items.add(sig)
                activity.append(item)

        activity.append(
            Activity(
                id=0,
                user_task=user_task,
                type=Activity.FIRST_SEEN,
                datetime=user_task.created,
            )
        )

        return activity[:num]

    def get(self, request, user_task_id):
        user_task = UserTask.objects.get(pk=user_task_id)

        activity = self._get_activity(request, user_task, num=100)
        print(activity)

        return Response(serialize(user_task), status=200)
