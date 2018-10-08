from __future__ import absolute_import
import requests
import logging

logger = logging.getLogger(__name__)


class WorkflowEngine(object):
    """
    A client that interfaces with the Camunda workflow engine API
    """

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

            resp = requests.post("http://localhost:8080/engine-rest/deployment/create",
                                 files=payload,
                                 headers={"Accept": "application/json"})
            if resp.status_code != 200:
                # TODO
                raise WorkflowEngineException(resp.__dict__)


class WorkflowEngineException(Exception):
    pass


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    client = WorkflowEngine()
    client.deploy("/home/stest683/source/commonlims/clims-snpseq/src/sentry_plugins/snpseq/workflows/sequence.bpmn",
                  "sequence.bpmn")
