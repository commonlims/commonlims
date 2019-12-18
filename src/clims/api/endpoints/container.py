from __future__ import absolute_import

from rest_framework.permissions import IsAuthenticated

from sentry.api.base import DEFAULT_AUTHENTICATION
from sentry.api.paginator import OffsetPaginator
from sentry.api.bases.organization import OrganizationEndpoint
from clims.api.serializers.models.container import ContainerSerializer
from clims.api.serializers.models.container import ContainerExpandedSerializer
from clims.services.container import ContainerQueryBuilder


class ContainerEndpoint(OrganizationEndpoint):
    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    def get(self, request, organization):
        # TODO: Filter by the organization
        query = request.GET.get('query', '')
        expand = request.GET.get('expand', None) == 'true'
        if expand:
            serializer_class = ContainerExpandedSerializer
        else:
            serializer_class = ContainerSerializer

        query_builder = ContainerQueryBuilder(query)
        query_builder.order_by_created_date()
        containers = self.app.containers.filter_from(query_builder)

        def handle_results(containers):
            ret = list()
            for c in containers:
                json = serializer_class(c).data
                ret.append(json)
            return ret

        return self.paginate(
            request=request,
            queryset=containers,
            paginator_cls=OffsetPaginator,
            default_per_page=25,
            on_results=lambda data: handle_results(data))
