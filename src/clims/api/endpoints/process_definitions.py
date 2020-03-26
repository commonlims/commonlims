from __future__ import absolute_import

import logging
from rest_framework.permissions import IsAuthenticated

from clims.api.serializers.models.process_definition import ProcessDefinitionSerializer
from sentry.api.base import SessionAuthentication
from sentry.api.bases.organization import OrganizationEndpoint
from sentry.api.paginator import OffsetPaginator

logger = logging.getLogger(__name__)


class ProcessDefinitionsEndpoint(OrganizationEndpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def get(self, request, organization):
        # NOTE: At the moment, all workflow definitions are application-wide, not organization-wide
        # Fetch all loaded workflows in the system:
        # TODO: Paging by using the ResultIterator
        workflows = list(self.app.workflows.get_workflows())

        return self.paginate(request=request,
                             queryset=workflows,
                             paginator_cls=OffsetPaginator,
                             default_per_page=20,
                             on_results=lambda data:
                             ProcessDefinitionSerializer(data, many=True).data)
