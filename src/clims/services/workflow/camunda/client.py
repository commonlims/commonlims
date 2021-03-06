from __future__ import absolute_import

import StringIO
import logging
import requests
from lxml import etree
from simplejson import JSONDecodeError
from six.moves.urllib.parse import urljoin
from clims.models.workunit import WorkUnit, ExternalWorkUnit

from .api import CamundaApi, UnexpectedHttpResponse
from clims import utils
from clims.models import Workflow

logger = logging.getLogger(__name__)


class CamundaClient(object):
    """
    A client for executing workflows that interfaces with the underlying workflow engine.
    It's higher level than CamundaApi which directly maps to the CamundaApi.
    """

    def __init__(self, base_url):
        self.base_url = base_url
        self.api = CamundaApi(self.base_url)
        logger.debug("Initialized CamundaClient with url '{}'".format(
            self.base_url))

    def _url(self, resource):
        return urljoin(self.base_url, resource)

    def start_workflows(self, workflow, items):
        # NOTE: The REST API doesn't seem to provide batch start of processes at the moment, so
        # we have to call the endpoint several times:
        for item in items:
            self.start_workflow(workflow, item)

    def start_workflow(self, workflow, item):

        # Camunda expects a particular format:
        variables = {k: {"value": v} for k, v in workflow.variables.items()}
        json = {"businessKey": item.global_id, "variables": variables}

        url = self._url("process-definition/key/{}/start".format(
            workflow.get_full_name()))

        response = requests.post(url,
                                 json=json,
                                 headers={"Accept": "application/json"})
        json = response.json()
        logger.debug("Reply from Camunda [{}]: {}".format(
            response.status_code, json))

        if response.status_code == 200:
            return json
        else:
            raise UnexpectedHttpResponse(json["message"], response.status_code)

    def _add_tracked_object_ids(self, external_work_units):
        map_process_instance_id_to_business_object = dict({
            (external_work_unit.work_unit.external_workflow_instance_id, None)
            for external_work_unit in external_work_units
        })
        keys = ",".join(map_process_instance_id_to_business_object.keys())

        # TODO: Solve paging in one go in the api
        for process_instance in self.api.process_instances().get(
                processInstanceIds=keys):
            id = process_instance.json["id"]
            business_key = process_instance.json["businessKey"]
            map_process_instance_id_to_business_object[id] = business_key

        for external_work_unit in external_work_units:
            external_work_unit.tracked_object_global_id = map_process_instance_id_to_business_object[
                external_work_unit.work_unit.external_workflow_instance_id]

    def get_work_units(self, task_definition_key=None, process_definition_key=None):
        """
        Returns ExternalWorkUnits. These map to user tasks in camunda.
        """

        logger.debug(
            "Fetching tasks in Camunda from search filters: task_definition_key='{}', "
            "process_definition_key='{}'".format(task_definition_key,
                                                 process_definition_key))
        # TODO: Paging. Since we use the api, we must go through the paging mechanism.
        # TODO: We're using the formKey to tell clims which work configuration to use.
        # It would be simpler to just use the ID of the task (and it doesn't require a camunda
        # extension for bpmn)

        # 1. Fetch outstanding tasks matching the filters
        work_units = list()
        for res in self.api.tasks().get(
                taskDefinitionKey=task_definition_key,
                processDefinitionKey=process_definition_key):
            json = res.json

            work_unit = WorkUnit(
                external_work_unit_id=json["id"],
                workflow_provider=Workflow.BACKEND_CAMUNDA,
                external_workflow_instance_id=json["processInstanceId"],
                work_type=json["formKey"])
            # assert work_unit.work_type, "No work type defined {} {}".format(task_definition_key, process_definition_key)
            external_work_unit = ExternalWorkUnit(work_unit, None)

            # TODO: In the demo data from Camunda, there is an entry that doesn't have a
            # processInstanceId for some reason. Filtering it out now. Can be removed when
            # the demo data isn't added.
            if not work_unit.external_workflow_instance_id:
                continue
            work_units.append(external_work_unit)
        logger.debug("Fetched {} tasks from Camunda".format(len(work_units)))
        self._add_tracked_object_ids(work_units)
        return work_units

    def unsafe_delete_deployment(self, deployment_id):
        """
        Deletes a deployment by ID.

        This is for development and test purposes, so state can be cleaned up after a test, thus
        the `unsafe` prefix.

        Note that this cascades, so all related definitions are deleted.
        """
        logger.info(
            "Deleting deployment {} (should not run in production).".format(
                deployment_id))

        self.api.deployment(id=deployment_id).delete()

    def unsafe_delete_all_deployments(self):
        """
        Cleans the state in the Camunda instance, deleting all deployments that have been created.

        This is only intended for development and test purposes (unsafe)
        """
        logger.info(
            "Deleting all deployments in Camunda (should not run in production)."
        )
        for x in self.api.deployments().get():
            self.unsafe_delete_deployment(x.id)

    def _refine_xml(self, tree, namespace):
        """
        Adds a fully qualifed name to relative ones. This ensures that all IDs that require
        it will always have a fully qualified name so they will not clash with other plugins.

        Example: User creates a diagram with the ID "SequenceSimple" and then registers it
        through the plugin clims.plugins.demo.dnaseq, the process will actually be registered
        as clims.plugins.demo.dnaseq.SequenceSimple. Furthermore, all calls to to subprocesses
        will be made to fully qualified names using the same module.

        Form keys are also changed to the fully qualified version.

        If the user does fully qualify names (they contain a dot), no change takes place.
        """

        # Load the xml and make sure that we have fully qualified proccesses:
        root = tree.getroot()
        ns = {
            "bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL",
            "bpmndi": "http://www.omg.org/spec/BPMN/20100524/DI",
            "camunda": "http://camunda.org/schema/1.0/bpmn"
        }
        process = utils.single(root.findall("bpmn:process", ns))
        diagram = utils.single(root.findall("bpmndi:BPMNDiagram", ns))

        def is_relative(name):
            # Process names are relative to the module of the defining workflow class
            # if there are no dots in them, except at the beginning.
            # Example: .workflows.DataEntry => relative
            #          clims.workflows.DataEntry => absolute
            return "." not in name[1:]

        # A dict of all renamed elements (in particular relative process names that we're fully
        # qualifying):
        renamed_elements = dict()

        # Ensure that we have a fully qualified name of the process:
        process_id = process.attrib["id"]
        if process.attrib.get("name", "") == "":
            process.attrib["name"] = process_id

        if is_relative(process_id):
            process_id_fully_qualified = "{}.{}".format(namespace, process_id)
            process.attrib["id"] = process_id_fully_qualified
            renamed_elements[process_id] = process_id_fully_qualified

        # For all "call activities", i.e. calls to subprocesses, ensure that we have a
        # fully qualified name:
        call_activities = process.findall("bpmn:callActivity", ns)

        for call_activity in call_activities:
            # We fully qualify relative names for call activities too:
            called_process_id = call_activity.attrib["calledElement"]

            if is_relative(called_process_id):
                called_process_id_fully_qualified = "{}.{}".format(
                    namespace, called_process_id)
                call_activity.attrib[
                    "calledElement"] = called_process_id_fully_qualified

        # Qualify all form keys
        user_tasks = process.findall("bpmn:userTask", ns)
        for user_task in user_tasks:
            form_key = user_task.attrib.get("{http://camunda.org/schema/1.0/bpmn}formKey", None)
            if form_key and is_relative(form_key):
                form_key_qualified = "{}.{}".format(namespace, form_key)
                user_task.attrib["{http://camunda.org/schema/1.0/bpmn}formKey"] = form_key_qualified

        # Since we might have renamed the process ID, let's update the refs in the diagram:
        for dia_element in diagram.iter():
            bpmn_element_ref = dia_element.attrib.get("bpmnElement", None)
            if bpmn_element_ref and bpmn_element_ref in renamed_elements:
                dia_element.attrib["bpmnElement"] = renamed_elements[
                    bpmn_element_ref]

    def install_from_workflow_class(self, camunda_workflow):
        """
        Given a CamundaWorkflow class, installs the definition in Camunda.

        Adds a full namespace for each process definition that is relative, as well as all
        call activities.

        Returns a `Workflow` describing it.
        """

        defname = utils.class_full_name(camunda_workflow)

        logger.debug("Installing workflow definition in Camunda: {}".format(
            camunda_workflow))
        path = camunda_workflow.get_bpmn_path()

        tree = etree.parse(path)

        logger.debug("Refining workflow definition xml")
        self._refine_xml(tree, camunda_workflow.__module__)

        logger.debug("Creating in-memory file for uploading")
        fs = StringIO.StringIO(
            etree.tostring(tree,
                           encoding="UTF-8",
                           pretty_print=True,
                           xml_declaration=True))
        entry = self.install_file(defname,
                                  "{}.bpmn".format(camunda_workflow.__name__),
                                  fs)

        logger.debug("File for {} installed in Camunda: {}".format(
            defname, entry))
        if not entry:
            entry = self.get_process_definition_by_key(defname)
            logger.debug(
                "Fetched latest version of '{}' in Camunda: {}".format(
                    defname, entry))

        return Workflow(name=entry['key'],
                        external_id=entry['id'],
                        version=entry['version'],
                        backend=Workflow.BACKEND_CAMUNDA)

    def install_file(self, deployment_name, fname, file_like):
        """
        Deploys a BPMN workflow to the backend workflow engine.

        Returns a dictionary describing the entry in Camunda

        Returns None if the call was successful but the deployment already exists.
        """

        # NOTE: We could deploy all the files at once
        logger.info(
            "Deploying workflow definition '{}' to Camunda".format(fname))

        payload = {
            "deployment-name": deployment_name,
            "deployment-source": "clims",
            "deploy-changed-only": "true",
            fname: file_like
        }

        url = self._url("deployment/create")
        logger.info("Requesting {}".format(url))

        resp = requests.post(url,
                             files=payload,
                             headers={"Accept": "application/json"})
        try:
            json = resp.json()
        except JSONDecodeError:
            json = dict()
        logger.debug("Response from {}: [{}] {}".format(
            url, resp.status_code, json))

        if resp.status_code != 200:
            raise CamundaError(
                "Error code {} when connecting to Camunda: {}".format(
                    resp.status_code, json.get("message", "(null)")))

        deployed = json['deployedProcessDefinitions'] or dict()

        if len(deployed) == 0:
            return None
        elif len(deployed) > 1:
            raise AssertionError(
                "Unexpected number of deployed process definitions: {}".format(
                    len(deployed)))
        else:
            return deployed.values()[0]

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

    def _process_definition_info(self, process_definition_id):
        definition = self.process_definition(process_definition_id)
        return {"name": definition["name"], "key": definition["key"]}

    def process_instances(self, business_key=None, **kwargs):
        """Returns all process instances"""
        params = kwargs or dict()
        params.update({"businessKey": business_key})
        process_instances = self.api.process_instances().get(**params)

        def map_activity_instance(json):
            return {
                "id": json["id"],
                "parentActivityInstanceId": json["parentActivityInstanceId"],
                "name": json["name"],
                "taskDefinitionKey": json["id"].split(":")[0]
            }

        # TODO: Fetch details about the process definition and cache it, as the frontend will most likely
        # need this info
        for instance in process_instances:
            instance.json[
                "processDefinitionInfo"] = self._process_definition_info(
                    instance.json["definitionId"])

            activity_instances = instance.activity_instances().get(
            ).json["childActivityInstances"]
            activities = [
                map_activity_instance(json) for json in activity_instances
            ]
            instance.json["activities"] = activities

        return [instance.json for instance in process_instances]

    def get_process_definition_by_key(self, key):
        """
        Fetches the latest process definition by key
        """
        return self._get("process-definition/key/{}".format(key))

    def process_definition(self, process_definition_id):
        return self._get("process-definition/{}".format(process_definition_id))

    def process_definitions(self, process_definition_key=None, **kwargs):
        """Returns all process definitions"""
        params = kwargs or dict()
        params.update({
            # TODO: Decide on how to handle mapping between casing styles in the two systems
            "definitionKey": process_definition_key
        })
        return self._get("process-definition", params=params)

    def get_outstanding_tasks(self,
                              process_definition=None,
                              task_definition=None):
        process_instances = self.process_instances(
            active="true", processDefinitionKey=process_definition)

        ret = list()
        for process_instance in process_instances:
            for activity in process_instance["activities"]:
                if activity["taskDefinitionKey"] == task_definition:
                    activity["businessKey"] = process_instance["businessKey"]
                    ret.append(activity)
        return ret


class CamundaError(Exception):
    pass
