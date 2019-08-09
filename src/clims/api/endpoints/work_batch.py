from __future__ import absolute_import

from rest_framework.response import Response
from clims.api.bases.work_batch import WorkBatchBaseEndpoint
from sentry.api.bases.organization import OrganizationEndpoint
from clims.models import WorkBatch
from clims.api.serializers.models.workbatch import WorkBatchSerializer
from sentry.models.activity import Activity
from sentry.api.paginator import OffsetPaginator


class WorkBatchEndpoint(OrganizationEndpoint):

    def get(self, request, organization):
        work_batches = WorkBatch.objects.filter(organization=organization)
        return self.paginate(
            request=request,
            queryset=work_batches,
            paginator_cls=OffsetPaginator,
            on_results=lambda x: WorkBatchSerializer(x, many=True).data,
        )


class WorkBatchDetailsEndpoint(WorkBatchBaseEndpoint):
    def get(self, request, work_batch_id):
        work_batch = WorkBatch.objects.get(pk=work_batch_id)
        return Response(WorkBatchSerializer(work_batch).data, status=200)


class WorkBatchDetailsActivityEndpoint(WorkBatchBaseEndpoint):
    def get(self, request, work_batch_id):
        return Response("", 200)

        work_batch = WorkBatch.objects.get(pk=work_batch_id)

        activity = Activity.objects.filter(
            work_batch=work_batch,
        ).order_by('-datetime').select_related('user')

        return self.paginate(
            request=request,
            queryset=activity,
            paginator_cls=OffsetPaginator,
            on_results=lambda x: WorkBatchSerializer(x, many=True).data)
