from __future__ import absolute_import
import requests
import logging
from urlparse import urljoin

logger = logging.getLogger(__name__)


class WorkflowEngine(object):
    """
    A client that interfaces with the Camunda workflow engine API

    # TODO: **kwargs the bunch
    """
    def __init__(self):
        self.base_url = "http://localhost:8080/engine-rest/"

    def _url(self, resource):
        return urljoin(self.base_url, resource)

    def deploy(self, workflow_file_path, key=None):
        """Deploys a BPMN workflow to the backend workflow engine"""
        import os

        with open(workflow_file_path, 'rb') as fs:
            name = key or os.path.basename(workflow_file_path)
            payload = {
                "deployment-name": "test-name",
                "enable-duplicate-filtering": "true",
                "deploy-changed-only": "true",
                name: fs
            }

            resp = requests.post(self._url("deployment/create"),
                                 files=payload,
                                 headers={"Accept": "application/json"})
            if resp.status_code != 200:
                # TODO
                raise WorkflowEngineException(resp.__dict__)

    def _get(self, resource, params=None):
        # TODO: paging
        logging.basicConfig(level=logging.DEBUG)
        url = self._url(resource)
        response = requests.get(url, params)
        if response.status_code == 200:
            return response.json()
        else:
            raise UnexpectedHttpResponse(url, response.status_code)

    def process_instances(self, business_key=None, **kwargs):
        """Returns all process instances"""
        # http://localhost:8080/engine-rest/process-instance/17bb2aa5-cdef-11e8-8633-0a0027000002
        params = kwargs or dict()
        params.update({
            "businessKey": business_key})
        return self._get("process-instance", params=params)

    def process_definitions(self, process_definition_key=None, **kwargs):
        """Returns all process definitions"""
        params = kwargs or dict()
        params = params.update({
            "processDefinitionKey": process_definition_key})
        return self._get("process-definitions", params=params)


class WorkflowEngineException(Exception):
    pass


class UnexpectedHttpResponse(Exception):
    pass


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    client = WorkflowEngine()
    processes = client.process_instances(processDefinitionKey="snpseq.poc.sequence")
    import pprint
    pprint.pprint(processes)
    #client.deploy("/home/stest683/source/commonlims/clims-snpseq/src/sentry_plugins/snpseq/workflows/sequence.bpmn",
    #              "sequence.bpmn")
    #client.process_definitions(

