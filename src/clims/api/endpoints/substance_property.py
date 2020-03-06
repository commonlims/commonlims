

from rest_framework.permissions import IsAuthenticated

from sentry.api.base import DEFAULT_AUTHENTICATION
from sentry.api.paginator import OffsetPaginator
from sentry.api.bases.organization import OrganizationEndpoint


class SubstancePropertyEndpoint(OrganizationEndpoint):
    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    def get(self, request, organization, prop):
        # TODO: Filter by the organization

        unique = request.GET.get('unique', False)

        if unique:
            unique_values_of_prop = self.app.substances.get_unique_values_of_property(property=prop)
            return self.paginate(
                request=request,
                queryset=list(unique_values_of_prop),
                paginator_cls=OffsetPaginator,
                default_per_page=25)
        else:
            values_of_prop = self.app.substances.get_values_of_property(property=prop)
            return self.paginate(
                request=request,
                queryset=values_of_prop,
                paginator_cls=OffsetPaginator,
                default_per_page=25)
