

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from sentry.api.base import Endpoint, SessionAuthentication
from clims.workflow import WorkflowEngine


class TaskTypesEndpoint(Endpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def get(self, request, organization_slug):
        """Lists all active task names for querying outstanding tasks"""
        # TODO: This is very expensive using this endpoint. Look for another one or look into
        #       if we should take a non-rest approach. For a POC this is OK
        #       A rather simple way of dealing with it might be to cache it and then incrementally add
        #       to the cache using filtering parameters in the rest interface
        # TODO: Pagination
        # TODO: Ignoring org for now (proto)

        # TODO: Decision needed. We're using the other endpoint to fetch data, but since it's paged
        # there is always a slight reason to believe that things might have altered, unless we're
        # getting data ordered by ID, date created or similar. This would not be a problem if our
        # backend would only be a database.

        # TODO: We can perhaps do this in a more sensible way
        engine = WorkflowEngine()
        tasks = engine.get_tasks()

        ret = set()
        for task in tasks:
            ret.add(task["name"])

        # TODO: implement paging
        return Response(ret, status=200)
