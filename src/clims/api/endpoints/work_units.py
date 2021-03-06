from __future__ import absolute_import

import logging

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sentry.api.bases.organization import OrganizationEndpoint

from sentry.api.base import DEFAULT_AUTHENTICATION, Endpoint

from clims.api.serializers.models.workunit import WorkUnitSerializer

logger = logging.getLogger(__name__)


class WorkUnitsEndpoint(OrganizationEndpoint):
    # Returns active WorkUnits, which may be filtered
    name = 'clims-api-0-work-units'

    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    def get(self, request, organization):
        # TODO-medium: paging
        process_definition_key = request.GET.get("processDefinitionKey")
        work_definition_key = request.GET.get("workDefinitionKey")

        work_units = self.app.workflows.get_work_units(work_definition_key,
                                                       process_definition_key)
        ret = WorkUnitSerializer(work_units, many=True).data
        return Response(ret)


class WorkUnitsByWorkDefinitionEndpoint(Endpoint):
    """
    Returns the WorkUnits available for a particular WorkDefinition
    """

    name = 'clims-api-0-work-units-by-work-definition'

    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    def get(self, request, work_definition_id):
        process_definition_key, work_definition_key = work_definition_id.split(":")
        work_units = self.app.workflows.get_work_units(work_definition_key,
                                             process_definition_key)
        ret = WorkUnitSerializer(work_units, many=True).data
        return Response(ret)
