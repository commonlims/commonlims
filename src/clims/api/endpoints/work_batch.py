from __future__ import absolute_import

import logging
from rest_framework.response import Response
from sentry.api.bases.organization import OrganizationEndpoint
from clims.api.serializers.models.work_batch import WorkBatchSerializer, WorkBatchCreateSerializer
from clims.services.workbatch import WorkBatchQueryBuilder
from sentry.api.paginator import OffsetPaginator


logger = logging.getLogger(__name__)


class WorkBatchEndpoint(OrganizationEndpoint):
    name = 'clims-api-0-work-batches'

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
        # TODO: Serializer for this, validation
        work_units = request.data
        validator = WorkBatchCreateSerializer(data=work_units)
        if not validator.is_valid():
            return Response(validator.errors, status=400)

        logger.debug("Creating workbatches for task list: {}".format(validator.validated_data))
        work_unit_ids = validator.validated_data['work_units']

        # Creating a workbatch takes a list of tasks that are ready for a work batch:
        work_batch = self.app.workflows.start_work(work_unit_ids, organization)
        work_batch = WorkBatchSerializer(work_batch).data

        return Response(work_batch, 201)
