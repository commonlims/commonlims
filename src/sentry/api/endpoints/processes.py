from __future__ import absolute_import

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from sentry.api.base import Endpoint, SessionAuthentication
from clims.workflow import WorkflowEngine


class TaskGroupsEndpoint(Endpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        # TODO: Ignoring org for now (proto)
        engine = WorkflowEngine()
        # TODO: Query params
        tasks = engine.get_tasks()

        # NOTE: This endpoint is potentially very heavy, as we must currently fetch the entire task list
        # even if we don't require much of it. See discussion here:
        # https://forum.camunda.org/t/get-a-list-of-different-task-types-via-the-rest-interface/10484/6
        # TODO: Must be resolved after POC

        ret = dict()

        # TODO: Doesn't cover different versions of the processes for now
        for task in tasks:
            key = task["processDefinitionInfo"]["key"] + ":" + task["taskDefinitionKey"]
            if key not in ret:
                ret[key] = {
                    "taskName": task["name"],
                    "taskKey": task["taskDefinitionKey"],
                    "process": task["processDefinitionInfo"]["key"],
                    "waitingCount": 1,
                    "id": key
                }
            else:
                ret[key]["waitingCount"] += 1

        data = list(ret.values())

        # TODO: implement paging
        return Response(data, status=200)


class ProcessesEndpoint(Endpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    # TODO: Interface with the workflow engine, via a proxy object, let's see if the paginator
    # will work for that or not
    # Look into how the SequencePaginator works
    def get(self, request, organization_slug):
        # TODO: Ignoring org for now (proto)
        engine = WorkflowEngine()
        tasks = engine.get_tasks()

        # TODO: implement paging
        return Response(tasks, status=200)
