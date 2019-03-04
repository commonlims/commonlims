from __future__ import absolute_import

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from sentry.api.base import Endpoint, DEFAULT_AUTHENTICATION
from sentry.api.serializers import serialize
from sentry.models import Sample
from sentry.plugins import plugins
from clims.workflow import WorkflowEngine


class SampleEndpoint(Endpoint):
    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        query = request.GET.get("query")

        samples = None

        # TODO: I guess there is some parser for this sentry structured query.
        # Look into that, hack for now:
        query_dict = dict()
        if query:
            query_items = [item.strip() for item in query.split(" ")]
            for query_item in query_items:
                key, value = query_item.split(":")
                query_dict[key] = value

        task = query_dict.get("task", None)
        process = query_dict.get("process", None)

        engine = WorkflowEngine()

        if task or process:
            # Start by finding all processes waiting for this particular task
            tasks = engine.get_outstanding_tasks(process_definition=process, task_definition=task)
            samples = [int(t["businessKey"].split("-")[1]) for t in tasks]

        # TODO: Bug, if the task is misspelled, we get everything, i.e. no filter occurs

        if samples:
            queryset = Sample.objects.filter(pk__in=samples)
        else:
            queryset = Sample.objects.filter()

        # TODO Yeah, this is just for the poc!
        # http://localhost:8080/engine-rest/process-instance?active=true
        processes = engine.process_instances(active="true")

        from collections import defaultdict
        processes_dict = defaultdict(list)

        for process in processes:
            processes_dict[process["businessKey"]].append(process["id"])

        from pprint import pprint
        pprint(processes)

        # TODO: If we decide on using Camunda as our workflow engine, consider pushing the workflow
        # data into the same postgresql instance and be able to query it (partially at least) through the ORM
        # Then this kind of query would be lightning fast and in it would be in some ways simpler
        data = list()
        for s in queryset:
            s.processes = processes_dict["sample-{}".format(s.id)]
            data.append(serialize(s))

            # NOTE: For completeness we add all processes to the sample, even though strictly there should only be
            # one, that is not necessarily true in the most generic case (it's just a business rule)

        # TODO: Paginate

        return Response(data, status=200)

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
