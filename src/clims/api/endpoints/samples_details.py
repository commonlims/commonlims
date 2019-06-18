from __future__ import absolute_import

import logging

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from uuid import uuid4

from sentry.api.base import Endpoint, DEFAULT_AUTHENTICATION
from sentry.api.exceptions import ResourceDoesNotExist
from sentry.api.serializers import serialize
from clims.api.serializers.models.sample import SampleSerializer

from sentry.models import ApiApplication, ApiApplicationStatus
from clims.models.sample import Sample
from sentry.tasks.deletion import delete_api_application

delete_logger = logging.getLogger('sentry.deletions.api')
logger = logging.getLogger(__name__)
from clims.workflow import WorkflowEngine


class SampleDetailsEndpoint(Endpoint):
    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    def get(self, request, sample_id):
        try:
            instance = Sample.objects.get(
                id=sample_id,
            )
        except ApiApplication.DoesNotExist:
            raise ResourceDoesNotExist

        s = serialize(instance, request.user, serializer=SampleSerializer())
        return Response(s)

    def put(self, request, app_id):
        pass
        # try:
        #     instance = Sample.objects.get(
        #         # owner=request.user,
        #         id=app_id,
        #         # status=ApiApplicationStatus.active,
        #     )
        # except ApiApplication.DoesNotExist:
        #     raise ResourceDoesNotExist

        # serializer = SampleSerializer(data=request.DATA, partial=True)

        # if serializer.is_valid():
        #     result = serializer.object
        #     csv = result['csv'].split("\n")
        #     header = csv[0]
        #     body = csv[1:]
        #     keys = header.split(";")
        #     obj = dict()
        #     for line in body:
        #         values = line.split(";")
        #         obj.update(zip(keys, values))

        #     if result:
        #         instance.update(**result)
        #     return Response(serialize(instance, request.user), status=200)
        # return Response(serializer.errors, status=400)

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


class SampleWorkflowsBatchEndpoint(Endpoint):
    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    def post(self, request, organization_slug):
        # TODO(withrocks): Go through a serializer object for this, and validate
        data = request.DATA
        engine = WorkflowEngine()

        for sample in data["samples"]:
            # variables = {
            #     "method": "Ready-made libraries",
            #     "sample_type": "rna",
            #     "sequencer": "HiSeq X"
            # }
            business_key = "sample-{}".format(sample)
            process = data["process"]
            variables = data["variables"]
            engine.start_process(process, business_key, variables)

        return Response(dict(), status=200)


class SampleWorkflowsEndpoint(Endpoint):
    """
    Lists relations between samples and workflows
    """
    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    # test 2
    def post(self, request):
        pass

    def get(self, request, sample_id):
        pass

        # 1. Get all workflow definitions that are top level/sample level (from plugins). This should be a per-process cached list
        #    NOTE: We might actually have several top level/sample level workflows, which would lead to a bunch of calls
        #    here, so we might want to revisit that from a perf. perspective later. But currently, that's unlikely.
        # 2. Query the workflow backend for those
        # 3.

        # First, simply get the list of all workflows this process is in. Note that if this list is large, it might
        # make sense to add processDefinitionKey to the query, but then we would
        # have to execute more queries
        from clims.workflow import WorkflowEngine
        engine = WorkflowEngine()
        instances = engine.process_instances(business_key="sample-{}".format(sample_id),
                                             active="true", suspended="false")
        # todo: paging
        # TODO: ended, suspended should be query parameters
        # TODO Have the engine service group this:

        ret = list()
        for instance in instances:
            # TODO: ask the plugin how they want the workflow to be shown. The plugin might want the
            # entry level processes to be shown e.g. like "Sequence - HiSeqX - RML", based on workflow
            # variables. Since the variables are not loaded by default with the process, the plugin
            # developer is provided with
            key, version, _ = instance["definitionId"].split(":")
            instance["definitionKey"] = key
            instance["definitionVersion"] = version

            # TODO: demo
            instance["variables"] = {
                "sequencer": "HiSeqX",
                "method": "Ready-made libraries"
            }
            if not plugin_is_entry_level_process(instance):
                continue

            # TODO: cache the title, since it requires loading vars
            instance["title"] = plugin_get_workflow_title(instance)
            ret.append(instance)
        return Response(ret, status=200)


class SampleProcessesEndpoint(Endpoint):
    """
    Lists relations between samples and samples
    """
    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    def get(self, request, sample_id):
        # TODO: Take active from the query
        from clims.workflow import WorkflowEngine
        engine = WorkflowEngine()
        instances = engine.process_instances(business_key="sample-{}".format(sample_id),
                                             active="true", suspended="false")

        return Response(instances, status=200)
        # todo: paging
        # TODO: ended, suspended should be query parameters
        # TODO Have the engine service group this:

        ret = list()
        for instance in instances:
            # TODO: ask the plugin how they want the workflow to be shown. The plugin might want the
            # entry level processes to be shown e.g. like "Sequence - HiSeqX - RML", based on workflow
            # variables. Since the variables are not loaded by default with the process, the plugin
            # developer is provided with
            key, version, _ = instance["definitionId"].split(":")
            instance["definitionKey"] = key
            instance["definitionVersion"] = version

            # TODO: demo
            instance["variables"] = {
                "sequencer": "HiSeqX",
                "method": "Ready-made libraries"
            }
            if not plugin_is_entry_level_process(instance):
                continue

            # TODO: cache the title, since it requires loading vars
            instance["title"] = plugin_get_workflow_title(instance)
            ret.append(instance)
        return Response(ret, status=200)


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
