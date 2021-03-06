from __future__ import absolute_import

from rest_framework.permissions import IsAuthenticated

from sentry.api.base import DEFAULT_AUTHENTICATION
from rest_framework.response import Response
from rest_framework import status
from sentry.api.bases.organization import OrganizationEndpoint
from clims.api.serializers.event import EventSerializer


class EventEndpoint(OrganizationEndpoint):
    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    def post(self, request, organization):
        # This endpoint is constructed in order to trigger a plugin script,
        # specified by input parameters.
        serializer = EventSerializer(data=request.data)
        if not serializer.is_valid():
            return self.respond(serializer.errors, status=400)

        work_batch_id = serializer.validated_data.get('work_batch_id')
        event = serializer.validated_data.get('event')

        workbatch = self.app.workbatches.get(id=work_batch_id)
        workbatch.trigger(event)
        ret = {}
        return Response(ret, status=status.HTTP_201_CREATED)
