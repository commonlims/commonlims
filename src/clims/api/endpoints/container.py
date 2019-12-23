from __future__ import absolute_import

from rest_framework.permissions import IsAuthenticated

from sentry.api.base import DEFAULT_AUTHENTICATION
from sentry.api.paginator import OffsetPaginator
from sentry.api.bases.organization import OrganizationEndpoint
from clims.api.serializers.models.container import ContainerSerializer


class ContainerEndpoint(OrganizationEndpoint):
    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    def get(self, request, organization):
        # TODO: Filter by the organization
        search_string = request.GET.get('search', '')
        # expand = request.GET.get('expand', None) == 'true'
        queryset = self.app.containers.search(search_string)
        # Temporarily sort by date

        return self.paginate(
            request=request,
            queryset=queryset,
            paginator_cls=OffsetPaginator,
            default_per_page=25,
            on_results=lambda data: ContainerSerializer(data, many=True).data)
