from __future__ import absolute_import

import six

from django.http import Http404

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from sentry.api.base import Endpoint, DEFAULT_AUTHENTICATION
from sentry.api.serializers import serialize
from django.db.models import Q
from sentry.db.models.query import in_iexact
from sentry.models import Sample
from sentry.models import ProjectPlatform
from sentry.plugins import plugins
from sentry.search.utils import tokenize_query
from clims.workflow import WorkflowEngine
from sentry.api.serializers.models.sample import SampleSerializer


class SampleEndpoint(Endpoint):
    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    def get(self, request):

        queryset = Sample.objects

        query = request.GET.get('query')
        if query:
            tokens = tokenize_query(query)
            for key, value in six.iteritems(tokens):
                if key == 'query':
                    value = ' '.join(value)
                    queryset = queryset.filter(Q(name__icontains=value) | Q(slug__icontains=value))
                elif key == 'slug':
                    queryset = queryset.filter(in_iexact('slug', value))
                elif key == 'name':
                    queryset = queryset.filter(in_iexact('name', value))
                elif key == 'platform':
                    # TODO I don't know what this means, and perhaps we should just
                    #      remove it? /JD 2019-03-04
                    queryset = queryset.filter(
                        id__in=ProjectPlatform.objects.filter(
                            platform__in=value,
                        ).values('project_id')
                    )
                elif key == 'id':
                    queryset = queryset.filter(id__in=value)
                else:
                    queryset = queryset.none()

        task = request.GET.get("task", None)
        process = request.GET.get("process", None)

        engine = WorkflowEngine()
        if task or process:
            # Start by finding all processes waiting for this particular task
            tasks = engine.get_outstanding_tasks(process_definition=process, task_definition=task)
            samples = [int(t["businessKey"].split("-")[1]) for t in tasks]

            if samples:
                queryset = Sample.objects.filter(pk__in=samples)
            else:
                raise Http404("No resources found")

        return Response(serialize(queryset, serializer=SampleSerializer()), status=200)

    def post(self, request):
        sample = Sample.objects.create(
            # TODO
            # owner=request.user,
            # status=.CREATED
        )
        return Response(serialize(sample, request.user), status=201)


class SampleBatchDetailsEndpoint(Endpoint):
    authentication_classes = DEFAULT_AUTHENTICATION
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
    authentication_classes = DEFAULT_AUTHENTICATION
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
