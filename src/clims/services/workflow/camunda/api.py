from __future__ import absolute_import
import requests
import logging
from six.moves.urllib.parse import urljoin
from string import Formatter

logger = logging.getLogger(__name__)

# Helper objects


class UnexpectedHttpResponse(Exception):
    pass


class Builder(object):
    """
    An object that creates the built object when called. This allows us to make it look
    like we're returning a factory when in fact we're returning an instance
    """

    def __init__(self, resource_type, url, many):
        self.resource_type = resource_type
        self.url = url
        self.many = many

    def __call__(self, **kwargs):
        return Requestor(self.resource_type, self.url, self.many, **kwargs)

    def __str__(self):
        return "<Builder {} at {}, many={}>".format(self.resource_type,
                                                    self.url, self.many)


class Requestor(object):
    """
    The object that knows what to do when requesting things. Returns a resource object or list
    of resource objects
    """

    def __init__(self, resource_type, url, many, **kwargs):
        self.url = url.format(**kwargs)
        self.validate_url()
        self.resource_type = resource_type
        self.many = many

    def _url(self, resource):
        return urljoin(self.base_url, resource)

    def validate_url(self):
        fmt = Formatter()
        if len(list(fmt.parse(self.url))) > 1:
            raise Exception("Uninitialized format specifiers in url {}".format(
                self.url))

    def get(self, **params):
        logger.debug("Fetching {} with params {}".format(self.url, params))
        response = requests.get(self.url, params=params)
        if response.status_code == 200:
            result = response.json()

            # TODO: Here we need to implement paging
            if not self.many:
                primary_key = result[self.resource_type.primary_key_field]
                return self.resource_type(self.url, result, primary_key)

            ret = list()
            for entry in result:
                primary_key = entry[self.resource_type.primary_key_field]
                ret.append(
                    self.resource_type(self.url + "/" + primary_key, entry,
                                       primary_key))
            return ret
        else:
            raise UnexpectedHttpResponse(self.url, response.status_code)

    def delete(self):
        response = requests.delete(self.url, params={"cascade": "true"})
        if response.status_code != 204:
            raise UnexpectedHttpResponse(self.url, response.status_code)

    def __str__(self):
        return "<{} url={}>".format(type(self).__name__, self.url)


class ResourceOfType(object):
    def __init__(self, resource_type, url):
        self.resource_type = resource_type
        self.url = url
        self.many = False

    def __get__(self, parent, type=None):
        url = parent.url + "/" + self.url
        return Builder(self.resource_type, url, many=self.many)


class ResourcesOfType(ResourceOfType):
    def __init__(self, resource_type, url):
        super(ResourcesOfType, self).__init__(resource_type, url)
        self.many = True


class CamundaResource(object):
    """Represents a single resource endpoint in the Camunda rest api"""

    primary_key_field = "id"

    def __init__(self, url, json, id):
        self.id = id
        self.url = url
        self.json = json

    def __str__(self):
        return "<{} url={}>".format(type(self).__name__, self.url)

    def __repr__(self):
        return self.url


# Resources


class ActivityInstance(CamundaResource):
    pass


class ProcessInstance(CamundaResource):
    pass

    # NOTE: This is a single entry, even though it's plural (it contains several intries)
    activity_instances = ResourceOfType(ActivityInstance, "activity-instances")


class ProcessDefinition(CamundaResource):
    pass


class Deployment(CamundaResource):
    pass


class Task(CamundaResource):
    pass


class CamundaApi(object):
    """Describes the Camunda API"""

    def __init__(self, url):
        if url.endswith("/"):
            url = url[:-1]
        self.url = url

    process_definition = ResourceOfType(ProcessDefinition,
                                        "process-definition/{id}")

    process_instance = ResourceOfType(ProcessInstance, "process-instance/{id}")
    process_instances = ResourcesOfType(ProcessInstance, "process-instance")

    deployment = ResourceOfType(Deployment, "deployment/{id}")
    deployments = ResourcesOfType(Deployment, "deployment")

    task = ResourceOfType(Task, "task/{id}")
    tasks = ResourcesOfType(Task, "task")
