from __future__ import absolute_import

from sentry.api.paginator import OffsetPaginator
from sentry.api.bases.organization import OrganizationEndpoint
from clims.api.serializers.models.work_definition import WorkDefinitionSerializer

# TODO: this module should probably be removed and replaced by work_batch_details_definition.py


class AvailableWorkEndpoint(OrganizationEndpoint):
    name = 'clims-api-0-available-work'

    def get(self, request, organization):
        work_definitions = self.app.workflows.get_work_definitions()

        return self.paginate(
            request=request,
            queryset=work_definitions,
            paginator_cls=OffsetPaginator,
            on_results=lambda entry: WorkDefinitionSerializer(entry, many=True).data,
        )
