from __future__ import absolute_import

import logging

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from sentry.api.base import Endpoint, DEFAULT_AUTHENTICATION
from sentry.api.exceptions import ResourceDoesNotExist
from clims.api.serializers.models.substance import SubstanceSerializer

from clims.models.substance import Substance

logger = logging.getLogger(__name__)


class SubstanceDetailsEndpoint(Endpoint):
    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    def get(self, request, substance_id):
        # TODO: Organization rights?
        try:
            instance = Substance.objects.get(id=substance_id)
        except Substance.DoesNotExist:
            raise ResourceDoesNotExist

        return Response(SubstanceSerializer(instance).data)

    def put(self, request, app_id):
        raise NotImplementedError()

    def delete(self, request, app_id):
        # TODO: Deleting should only mark the substance as deleted
        raise NotImplementedError()


def plugin_is_entry_level_process(instance):
    sample_level_workflows = ["snpseq.poc.sequence", "clims_snpseq.sequence"]
    for workflow in sample_level_workflows:
        if instance["definitionId"].startswith(workflow):
            return True
    return False


def plugin_get_workflow_title(instance):
    # TODO: have the variables lazy load into the object, and the object should not be a dict
    variables = instance["variables"]
    name = instance["definitionKey"].split(".")[-1]
    return " - ".join([name, variables["sequencer"], variables["method"]])
