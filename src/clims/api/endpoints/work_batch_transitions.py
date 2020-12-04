from __future__ import absolute_import


from rest_framework.response import Response
from rest_framework import status

from sentry.api.exceptions import ResourceDoesNotExist
from clims.models import WorkBatch
from clims.api.bases.work_batch import WorkBatchBaseEndpoint

from clims.api.serializers.models.transition import TransitionBatchSerializer


class WorkBatchTransitionsEndpoint(WorkBatchBaseEndpoint):
    name = 'clims-api-0-work-batch-transitions'

    def post(self, request, organization_slug, work_batch_id):
        """
        Create a new transition related to a WorkBatch
        ``````````````````````````````````````````````
        :param string organization_slug: the slug of the organization
        :param string work_batch_id: the id of the task
        """

        data = request.data

        # Validate Work Batch
        # TODO: scope by organization id - CLIMS-469
        try:
            work_batch = self.app.workbatches.get(id=work_batch_id)
        except WorkBatch.DoesNotExist:
            raise ResourceDoesNotExist

        validator = TransitionBatchSerializer(data=data)
        if not validator.is_valid():
            return self.respond(validator.errors, status=400)
        validated = validator.validated_data

        transition_ids = self.app.transitions.batch_create(
            work_batch.id,
            validated["transitions"]
        )
        ret = {"transitions": transition_ids}

        return Response(ret, status=status.HTTP_201_CREATED)
