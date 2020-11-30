from __future__ import absolute_import

from rest_framework.response import Response
from rest_framework import status
from clims.api.bases.work_batch import WorkBatchBaseEndpoint
from clims.api.serializers.models.work_batch_details import WorkBatchDetailsSerializer


class WorkBatchDetailsEndpoint(WorkBatchBaseEndpoint):
    def get(self, request, organization_slug, work_batch_id):
        workbatch = self.app.workbatches.get(id=work_batch_id)
        return Response(WorkBatchDetailsSerializer(workbatch).data, status=200)

    def put(self, request, organization_slug, work_batch_id):
        workbatch = self.app.workbatches.get(id=work_batch_id)
        serializer = WorkBatchDetailsSerializer(workbatch, data=request.data)
        if not serializer.is_valid():
            return self.respond(serializer.errors, status=400)
        serializer.save()
        return Response({}, status=status.HTTP_200_OK)
