from __future__ import absolute_import

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from sentry.api.base import Endpoint, SessionAuthentication
from clims.workflow import WorkflowEngine


class ProcessDefinitionsEndpoint(Endpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    # TODO: Interface with the workflow engine, via a proxy object, let's see if the paginator
    # will work for that or not
    # Look into how the SequencePaginator works
    def get(self, request, organization_slug):
        # TODO: Ignoring org for now (proto)

        engine = WorkflowEngine()
        definitions = engine.process_definitions()

        # TODO: implement paging
        return Response(sorted(definitions, key=lambda d: d["key"]), status=200)
