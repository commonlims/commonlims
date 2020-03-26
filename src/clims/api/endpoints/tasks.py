from __future__ import absolute_import

import logging

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sentry.api.bases.organization import OrganizationEndpoint

from sentry.api.base import DEFAULT_AUTHENTICATION

from clims.api.serializers.models.task import TaskSerializer

logger = logging.getLogger(__name__)


class TasksEndpoint(OrganizationEndpoint):
    # Returns active tasks, which may be filtered

    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    def get(self, request, organization):
        # TODO-medium: paging
        process_definition_key = request.GET.get("processDefinitionKey")
        task_definition_key = request.GET.get("taskDefinitionKey")

        tasks = self.app.workflows.get_tasks(task_definition_key,
                                             process_definition_key)
        ret = TaskSerializer(tasks, many=True).data

        return Response(ret)
