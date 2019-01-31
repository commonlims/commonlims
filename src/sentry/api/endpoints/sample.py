from __future__ import absolute_import

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from sentry.api.base import Endpoint, SessionAuthentication
from sentry.api.paginator import OffsetPaginator
from sentry.api.serializers import serialize
from clims.models import Sample
from sentry.plugins import plugins

# NOLIMS: Move to the clims module


class SampleEndpoint(Endpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        queryset = Sample.objects.filter(
            # owner=request.user,
            # status=ApiApplicationStatus.active,
        )

        return self.paginate(
            request=request,
            queryset=queryset,
            order_by='name',
            paginator_cls=OffsetPaginator,
            on_results=lambda x: serialize(x, request.user),
        )

    def post(self, request):
        sample = Sample.objects.create(
            # TODO
            # owner=request.user,
            # status=.CREATED
        )
        return Response(serialize(sample, request.user), status=201)


class SampleBatchDetailsEndpoint(Endpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def get(self, request, batch_id):
        d = {
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
        return Response(d, status=200)


class SampleBatchEndpoint(Endpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def put(self, request):
        data = request.DATA

        # -1. Figure out which plugins want to hook into saving sample batches.
        # Hard code for now

        # TODO: Always expect a correlation ID with some hash or similar that only the
        # server knows. This way the caller can not fake correlation info
        correlation = data["correlation"]

        # NOTE: This is very much a POC approach! Just hooking up extension points in the simplest
        # possible way for now
        plugin = plugins.get(correlation["plugin"])
        plugin.handle_event(correlation["handler"], "handle_sample_batch_pre_save", data)

        # 0. Create django domain objects

        # 1. Call the registered plugin with a pre_save event
        #    The idea is that the plugin developer has at some point created a mapping between the issuer key in the contract
        #    and plugin code
        # TODO: Validate issuer keys

        # 2. Actually save the data

        # 3.
        return Response(request.DATA, status=201)
