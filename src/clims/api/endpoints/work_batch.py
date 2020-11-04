from __future__ import absolute_import

import logging
from rest_framework.response import Response
from sentry.api.bases.organization import OrganizationEndpoint
from clims.models import WorkBatch
from clims.api.serializers.models.workbatch import WorkBatchSerializer
from sentry.api.paginator import OffsetPaginator

logger = logging.getLogger(__name__)


class WorkBatchEndpoint(OrganizationEndpoint):
    def get(self, request, organization):
        logging.debug("Fetching workbatches for {}".format(organization))

        work_batches = WorkBatch.objects.filter(organization=organization)
        return self.paginate(
            request=request,
            queryset=work_batches,
            paginator_cls=OffsetPaginator,
            on_results=lambda x: WorkBatchSerializer(x, many=True).data,
        )

    def post(self, request, organization):
        # TODO: Serializer for this, validation and ensure access rights for tasks
        tasks = request.data

        logger.debug("Creating workbatches for task list: {}".format(tasks))

        # Creating a workbatch takes a list of tasks that are ready for a work batch:
        work_batch = self.app.workflows.start_work(tasks, organization)
        work_batch = WorkBatchSerializer(work_batch).data

        return Response({"workBatch": work_batch}, 201)
