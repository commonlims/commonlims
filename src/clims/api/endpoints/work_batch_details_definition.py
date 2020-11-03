from __future__ import absolute_import

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from sentry.api.base import DEFAULT_AUTHENTICATION
from sentry.api.bases.organization import OrganizationEndpoint
from clims.api.serializers.models.work_batch_details_definition import WorkBatchDetailsDefinitionSerializer


class WorkBatchDetailsDefinitionEndpoint(OrganizationEndpoint):
    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    def get(self, request, organization, cls_full_name):
        # TODO: Filter by the organization
        serializer_class = WorkBatchDetailsDefinitionSerializer

        step_cls = self.app.extensibles.implementations[cls_full_name]
        step = step_cls()

        return Response(serializer_class(step).data)
