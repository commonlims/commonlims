from __future__ import absolute_import

from rest_framework.permissions import IsAuthenticated

from sentry.api.base import DEFAULT_AUTHENTICATION
from sentry.api.paginator import OffsetPaginator
from sentry.api.bases.organization import OrganizationEndpoint
from clims.api.serializers.models.step import StepSerializer


class StepEndpoint(OrganizationEndpoint):
    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    def get(self, request, organization):
        # TODO: Filter by the organization
        step_name = request.GET.get('name', '')
        serializer_class = StepSerializer

        step_cls = self.app.workbatches.get_step_template(step_name)
        step = step_cls()

        def handle_results(steps):
            ret = list()
            for s in steps:
                json = serializer_class(s).data
                ret.append(json)
            return ret

        return self.paginate(
            request=request,
            queryset=[step],
            paginator_cls=OffsetPaginator,
            default_per_page=25,
            on_results=lambda data: handle_results(data))
