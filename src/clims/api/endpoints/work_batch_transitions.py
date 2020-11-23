from __future__ import absolute_import


from rest_framework.response import Response
from rest_framework import status

from sentry.api.exceptions import ResourceDoesNotExist
from clims.models import WorkBatch, SubstanceLocation
from clims.api.bases.work_batch import WorkBatchBaseEndpoint

# from clims.api.serializers.models.transition import TransitionSerializer


class WorkBatchTransitionsEndpoint(WorkBatchBaseEndpoint):
    def post(self, request, organization_slug, work_batch_id):
        """
        Create a new transition related to a WorkBatch
        ``````````````````````````````````````````````
        :param string organization_slug: the slug of the organization
        :param string work_batch_id: the id of the task
        """

        # Contract format:
        # {"source_location_id":1, "target_location": {"container_id": 1, "x":0, "y":0, "z":0}, "transition_type": 1}
        data = request.data

        # Validate Work Batch
        # TODO: scope by organization id
        try:
            work_batch = self.app.workbatches.get(pk=int(work_batch_id))
        except WorkBatch.DoesNotExist:
            raise ResourceDoesNotExist

        # Validate Source Location
        # TODO: Full validation on source and target locations - CLIMS-464
        try:
            SubstanceLocation.objects.get(pk=int(data['source_location_id']))
        except SubstanceLocation.DoesNotExist:
            raise ResourceDoesNotExist

        # Currently this validator will always fail since the target location does not yet exist
        # TODO: Split app.transition.create into two calls,
        #  the first of which creates the target location record
        # validator = TransitionSerializer(data=data)
        # if not validator.is_valid():
        #    return self.respond(validator.errors, status=400)

        validated = data  # validator.validated_data
        transition = self.app.transitions.create(validated, work_batch.id)
        ret = {"transition": transition.id}

        return Response(ret, status=status.HTTP_201_CREATED)
