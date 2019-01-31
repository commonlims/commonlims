from __future__ import absolute_import

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from sentry.api.base import Endpoint, SessionAuthentication
from sentry.api.paginator import OffsetPaginator
from sentry.api.serializers import serialize
from clims.models import Sample

# {{TODO_TEMPLATE}}
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
