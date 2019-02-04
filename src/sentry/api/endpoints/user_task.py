from __future__ import absolute_import

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sentry.api.base import Endpoint, SessionAuthentication


class UserTaskEndpoint(Endpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        return Response([], status=200)

    def post(self, request):
        return Response([], status=201)


class UserTaskDetailsEndpoint(Endpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def get(self, request, batch_id):
        ret = {
            "transitions": [],
            "batchId": 237,
            "committed": False,
            "correlation": {
                "plugin": "snpseq",
                # The class that handles related events (path is relative to the plugin module)
                "handler": "features.fragment_analyze.controller.FragmentAnalyzeController",
                "hash": "hash-with-signature-TODO"
            },
            "samples": [
                {"name": "sample1", "id": 10, "location": {"row": 0, "col": 0, "containerId": 1}},
                {"name": "sample2", "id": 11, "location": {"row": 1, "col": 1, "containerId": 1}}
            ],
            "containers": [
                {"name": "cont-1", "id": 1, "isTemporary": False,
                    "dimensions": {"rows": 8, "cols": 12}, "typeName": "96 well plate"}
            ],
            "tempContainers": []
        }
        return Response(ret, status=200)
