from __future__ import absolute_import

import logging
from rest_framework.response import Response
from sentry.api.bases.organization import OrganizationEndpoint
from clims.api.serializers.models.work_batch import WorkBatchSerializer
from clims.services.workbatch import WorkBatchQueryBuilder
from sentry.api.paginator import OffsetPaginator


logger = logging.getLogger(__name__)


class WorkBatchEndpoint(OrganizationEndpoint):
    def get(self, request, organization):
        logging.debug("Fetching workbatches for {}".format(organization))
        query_from_url = request.GET.get('search', None)
        query_builder = WorkBatchQueryBuilder(query_from_url)
        filtered_workbatches = self.app.workbatches.filter_from(query_builder)

        return self.paginate(
            request=request,
            queryset=filtered_workbatches,
            paginator_cls=OffsetPaginator,
            on_results=lambda x: WorkBatchSerializer(x, many=True).data,
        )

    def post(self, request, organization):
        # TODO: Serializer for this, validation and ensure access rights for tasks
        tasks = request.data

        logger.debug("Creating workbatches for task list: {}".format(tasks))

        # Creating a workbatch takes a list of tasks that are ready for a work batch:
        work_batch = self.app.workflows.create_work_batch(tasks, organization)
        work_batch = WorkBatchSerializer(work_batch).data

        return Response({"workBatch": work_batch}, 201)
