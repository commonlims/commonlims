from __future__ import absolute_import

import logging

from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from uuid import uuid4

from sentry.api.base import Endpoint, SessionAuthentication
from sentry.api.exceptions import ResourceDoesNotExist
from sentry.models import ApiApplication, ApiApplicationStatus
from sentry.models import SampleGroup
from sentry.tasks.deletion import delete_api_application
from sentry.api.serializers import serialize

delete_logger = logging.getLogger('sentry.deletions.api')


# {{TODO_TEMPLATE}}


class SampleGroupSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=64)
    description = serializers.CharField(max_length=1000)
    csv = serializers.CharField(max_length=4000)


class SampleGroupDetailsEndpoint(Endpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def get(self, request, app_id):
        # TODO: app_id
        try:
            instance = SampleGroup.objects.get(
                # owner=request.user,
                id=app_id,
                # status=ApiApplicationStatus.active,
            )
        except ApiApplication.DoesNotExist:
            raise ResourceDoesNotExist

        s = serialize(instance, request.user)
        return Response(s)

    def put(self, request, app_id):
        try:
            instance = SampleGroup.objects.get(
                # owner=request.user,
                id=app_id,
                # status=ApiApplicationStatus.active,
            )
        except ApiApplication.DoesNotExist:
            raise ResourceDoesNotExist

        serializer = SampleGroupSerializer(data=request.data, partial=True)

        if serializer.is_valid():
            result = serializer.object
            csv = result['csv'].split("\n")
            header = csv[0]
            body = csv[1:]
            keys = header.split(";")
            obj = dict()
            for line in body:
                values = line.split(";")
                obj.update(zip(keys, values))
            if result:
                instance.update(**result)
            return Response(serialize(instance, request.user), status=200)
        return Response(serializer.errors, status=400)

    def delete(self, request, app_id):
        try:
            instance = ApiApplication.objects.get(
                owner=request.user,
                client_id=app_id,
                status=ApiApplicationStatus.active,
            )
        except ApiApplication.DoesNotExist:
            raise ResourceDoesNotExist

        updated = ApiApplication.objects.filter(
            id=instance.id,
        ).update(
            status=ApiApplicationStatus.pending_deletion,
        )
        if updated:
            transaction_id = uuid4().hex

            delete_api_application.apply_async(
                kwargs={
                    'object_id': instance.id,
                    'transaction_id': transaction_id,
                },
                countdown=3600,
            )

            delete_logger.info(
                'object.delete.queued',
                extra={
                    'object_id': instance.id,
                    'transaction_id': transaction_id,
                    'model': type(instance).__name__,
                }
            )

        return Response(status=204)
