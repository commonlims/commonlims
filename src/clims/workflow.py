from __future__ import absolute_import
import requests
import logging
from six.moves.urllib.parse import urljoin
import os
from functools32 import lru_cache
from clims.camunda import CamundaApi, UnexpectedHttpResponse, ProcessDefinition


logger = logging.getLogger(__name__)

# TODO: while debugging
# logging.basicConfig(level=logging.DEBUG)


class WorkflowEngine(object):
    """
    A client that interfaces with the underlying workflow engine

    # TODO: **kwargs the bunch

    Modifying a process:
    https://docs.camunda.org/manual/7.4/reference/rest/process-instance/post-modification/
    """

    def __init__(self):
        self.base_url = "http://localhost:8080/engine-rest/"
        self.api = CamundaApi("http://localhost:8080/engine-rest")

    def _url(self, resource):
        return urljoin(self.base_url, resource)

    def deploy(self, workflow_file_path, key=None):
        """Deploys a BPMN workflow to the backend workflow engine"""

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
            json = resp.json()
            if resp.status_code != 200:
                # TODO
                raise WorkflowEngineException(json["message"])

    def _get(self, resource, params=None):
        url = self._url(resource)
        response = requests.get(url, params)
        if response.status_code == 200:
            if response.headers['Content-Type'] == 'application/json':
                return response.json()
            else:
                return response.text
        else:
            raise UnexpectedHttpResponse(url, response.status_code)

    @lru_cache(maxsize=1000)
    def _process_definition_info(self, process_definition_id):
        definition = self.process_definition(process_definition_id)
        return {"name": definition["name"], "key": definition["key"]}

    def process_instances(self, business_key=None, **kwargs):
        """Returns all process instances"""
        params = kwargs or dict()
        params.update({
            "businessKey": business_key})
        process_instances = self.api.process_instances().get(**params)

        def map_activity_instance(json):
            return {
                "id": json["id"],
                "parentActivityInstanceId": json["parentActivityInstanceId"],
                "name": json["name"]
            }

        # TODO: Fetch details about the process definition and cache it, as the frontend will most likely
        # need this info
        for instance in process_instances:
            instance.json["processDefinitionInfo"] = self._process_definition_info(
                instance.json["definitionId"])

            activity_instances = instance.activity_instances().get().json["childActivityInstances"]
            activities = [map_activity_instance(json) for json in activity_instances]
            instance.json["activities"] = activities

        return [instance.json for instance in process_instances]

    def process_definition(self, process_definition_id):
        return self._get("process-definition/{}".format(process_definition_id))

    def process_definitions(self, process_definition_key=None, **kwargs):
        """Returns all process definitions"""
        params = kwargs or dict()
        params = params.update({
            # TODO: Decide on how to handle mapping between casing styles in the two systems
            "processDefinitionKey": process_definition_key})
        return self._get("process-definition", params=params)

    def start_process(self, definition_key, business_key, variables, **kwargs):
        variables = {k: {"value": v} for k, v in variables.items()}
        json = {
            "businessKey": business_key,
            "variables": variables
        }
        logger.info("Starting process {}".format(definition_key), extra=json)

        url = self._url("process-definition/key/{}/start".format(definition_key))
        response = requests.post(url, json=json, headers={"Accept": "application/json"})
        json = response.json()
        if response.status_code == 200:
            return json
        else:
            raise UnexpectedHttpResponse(json["message"], response.status_code)

    def get_tasks(self, process_definition=None, business_key=None, **kwargs):
        """Returns tasks for the search parameters"""
        # TODO: Paging (as in all the others)
        params = kwargs or dict()

        if process_definition:
            params["processDefinitionKey"] = process_definition
        if business_key:
            params["businessKey"] = business_key

        # TODO(withrocks): In the prototype, we just return the data contract
        # as it comes from Camunda. It would be cleaner to map this to a data contract
        # specified by clims, making it possible to switch workflow engines. But not implementing
        # that in the POC
        tasks = self._get("task", params=params)

        ret = list()
        for task in tasks:
            definition_id = task["processDefinitionId"]
            if definition_id is None:
                logger.warn(task)
                continue  # TODO! Happens with one of the built camunda examples!
            task["processDefinitionInfo"] = self._process_definition_info(definition_id)
            ret.append(task)

        return ret


class WorkflowEngineException(Exception):
    pass


def test_start():
    client = WorkflowEngine()
    variables = {
        "method": "TruSeq methylation",
        "sample_type": "dna",
        "sequencer": "HiSeq X"
    }
    client.start_process("clims_snpseq.core.workflows.sequence", "samplex-1", variables)


def test_tasks_and_views():
    client = WorkflowEngine()
    tasks = client.get_tasks("clims_snpseq.core.workflows.reception_qc")

    # A dictionary of task IDs and process defition ID
    # todo(withrocks): I'm assuming that task IDs are only unique within a process
    tasks_by_def = dict()
    for task in tasks:
        unique_form_key = task["processDefinitionId"], task["taskDefinitionKey"]
        _, task_id = task["name"], task["id"]  # noqa
        if unique_form_key in tasks_by_def:
            print("Already fetched", unique_form_key)  # NOQA
        else:
            tasks_by_def[unique_form_key] = client.get_task_arguments(task_id)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    api = CamundaApi("http://localhost:8080/engine-rest")

    engine = WorkflowEngine()
    business_key = "sample-5"
    instances = engine.process_instances(business_key)
    print(instances)  # noqa

    exit()

    # Fetch the process_definition:
    pd = api.process_definition(id="73f920c0-d6a3-11e8-a538-0a0027000002")
    print(pd)  # noqa
    print(pd.get())  # noqa

    # Fetch the process instance and underlying activity instances:
    pi = api.process_instance(id="876c1234-102d-11e9-a538-0a0027000002")
    print(pi.get())  # noqa

    ais = pi.activity_instances()

    import pprint
    pprint.pprint(ais.get())

    # Find all process instances by sample. NB: paging is not implemented yet (TODO)

    exit()
    process_definition = ProcessDefinition(id="73f920c0-d6a3-11e8-a538-0a0027000002")
    print process_definition.get()  # noqa
    # print process_definition.activity_instances  #.get()

    # 0. Fetch all the process instances for a particular business key (e.g. a sample):
    business_key = "sample-5"
    engine = WorkflowEngine()
    instances = engine.process_instances(business_key)

    # ... then pick one of those
    some_instance_id = "876c1234-102d-11e9-a538-0a0027000002"
    instance = [instance for instance in instances if instance["id"] == some_instance_id][0]

    # 1. Our process instance is of a particular definition. Let's find out what that is
    process_definition_id = instance["definitionId"]
    definition = engine.process_definition(process_definition_id)
    print("DEFINITION")  # noqa
    print(definition)  # noqa
    print  # noqa

    # 2. We want to show the instance
    print("INSTANCE")  # noqa
    print(instance["processDefinitionInfo"])  # noqa
    print  # noqa

    # 3. ... with information about the activity tree

    # Fetch a particular process definition
    # curl
    # 'http://localhost:8080/camunda/api/engine/engine/default/process-definition/73f920c0-d6a3-11e8-a538-0a0027000002'

    # Fetch all the activity instances underneath:
    # curl
    # 'http://localhost:8080/camunda/api/engine/engine/default/process-instance/876c1234-102d-11e9-a538-0a0027000002/activity-instances'
