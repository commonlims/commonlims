from __future__ import absolute_import

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from sentry.api.base import Endpoint, DEFAULT_AUTHENTICATION
from clims.utils import single_or_default
from clims.api.serializers.models.work_definition import WorkDefinitionSerializer
from clims.api.serializers.models.workunit import WorkUnitSerializer


class WorkDefinitionDetailsEndpoint(Endpoint):
    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    name = 'clims-api-0-work-definition-details'

    def get(self, request, work_definition_id):
        # TODO: Here we split the key outside of the service. Move it into it.
        process_definition_key, work_definition_key = work_definition_id.split(':')
        work_definitions = self.app.workflows.get_work_definitions(
            process_definition_key, work_definition_key)
        ret = single_or_default(work_definitions)
        return Response(WorkDefinitionSerializer(ret).data)


class WorkUnitsByWorkDefinitionEndpoint(Endpoint):
    name = 'clims-api-0-work-units-by-work-definition'

    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    def get(self, request, work_definition_id):
        process_definition_key, work_definition_key = work_definition_id.split(":")
        work_units = self.app.workflows.get_work_units(work_definition_key,
                                             process_definition_key)
        ret = WorkUnitSerializer(work_units, many=True).data
        return Response(ret)
