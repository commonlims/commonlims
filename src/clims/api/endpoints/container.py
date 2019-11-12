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
        query = request.GET.get('query', '')
        # expand = request.GET.get('expand', None) == 'true'
        queryset = self.app.containers._search_qs(query)
        # Temporarily sort by date
        queryset = queryset.order_by('-archetype__created_at')

        def handle_results(qs):
            ret = list()
            for entry in qs:
                wrapper = self.app.containers.to_wrapper(entry)
                json = ContainerSerializer(wrapper).data
                ret.append(json)
            return ret

        return self.paginate(
            request=request,
            queryset=queryset,
            paginator_cls=OffsetPaginator,
            default_per_page=25,
            on_results=lambda data: handle_results(data))
