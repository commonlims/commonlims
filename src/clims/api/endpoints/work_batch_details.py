from __future__ import absolute_import

from rest_framework.response import Response
from clims.api.bases.work_batch import WorkBatchBaseEndpoint
from clims.models import WorkBatch
from clims.api.serializers.models.workbatch import WorkBatchSerializer


class WorkBatchDetailsEndpoint(WorkBatchBaseEndpoint):
    def get(self, request, work_batch_id):
        work_batch = WorkBatch.objects.get(pk=work_batch_id)
        return Response(WorkBatchSerializer(work_batch).data, status=200)
