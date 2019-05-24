from __future__ import absolute_import

import six

from django.http import Http404

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from sentry.api.base import Endpoint, DEFAULT_AUTHENTICATION
from sentry.api.serializers import serialize
from django.db.models import Q
from sentry.db.models.query import in_iexact
from clims.models import Sample
from sentry.models import ProjectPlatform
from sentry.plugins import plugins
from sentry.search.utils import tokenize_query
from clims.workflow import WorkflowEngine
from clims.api.serializers.models.sample import SampleSerializer
from sentry.api.paginator import OffsetPaginator


# TODO: Rename to ItemEndpoint (unless we find a better name, other options
# discussed were Element and Content). As these will encapsulate anything
# that can have a location in a container (except other containers), e.g. sample
# in a well, aliquot, index tag, pool etc, we model it as the same entity in the backend.

# This endpoint gan also gropu any of these items. If there is a gropby keyword in the get query,
# the returned value is a "ItemGroup" resource instead.
class SampleEndpoint(Endpoint):
    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    # TODO: The index endpoint must be on sample level!
    def get(self, request):
        group_by = request.GET.get('groupBy')
        print("Grouping by", group_by)

        # # To begin with, we'll just support a container here as it's the most obvious case
        # if group_by == "container":
        #     pass
        #     queryset = Sample.objects.all()

        queryset = Sample.objects.all()
        query = request.GET.get('query')
        if query:  # TODO: Ignoring the query while bugfixing
            tokens = tokenize_query(query)
            print(tokens)
            for key, value in six.iteritems(tokens):
                if key == 'name':
                    queryset = queryset.filter(in_iexact('name', value))
                elif key == 'id':
                    queryset = queryset.filter(id__in=value)
                else:
                    # query set has none of the supported keys, so it makes sense to return nothing
                    queryset = queryset.none()

        # task = request.GET.get("task", None)
        # process = request.GET.get("process", None)

        # engine = WorkflowEngine()
        # if task or process:
        #     # Start by finding all processes waiting for this particular task
        #     tasks = engine.get_outstanding_tasks(process_definition=process, task_definition=task)
        #     samples = [int(t["businessKey"].split("-")[1]) for t in tasks]
        #     print(samples)

        def _serialize(sample):
            # TODO: Add info from
            return serialize(sample)

        return self.paginate(
            request=request,
            queryset=queryset,
            paginator_cls=OffsetPaginator,
            on_results=lambda x: _serialize(x),
        )

    def post(self, request):
        sample = Sample.objects.create(
            # TODO
            # owner=request.user,
            # status=.CREATED
        )
        return Response(serialize(sample, request.user), status=201)


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
