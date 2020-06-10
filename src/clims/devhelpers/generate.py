from __future__ import absolute_import

import re
import os
from jinja2 import Template
import stringcase
from clims.devhelpers import resources

# TODO: This should be a separate module (e.g. clims_devtools)


class CodeGenerator(object):
    """
    Generates starting point code for the CLIMS project. Given a resource name, generates:
        * Redux actions and reducer
        * [TODO not implemented yet] API endpoint for listing the resource
        * [TODO not implemented yet] API endpoint for details
    """

    def __init__(self):
        self.actions_path = "src/sentry/static/sentry/app/redux/actions"
        self.reducers_path = "src/sentry/static/sentry/app/redux/reducers"

    def url_pattern_to_api_call(self, urlpattern):
        if urlpattern.startswith("^"):
            urlpattern = urlpattern[1:]
        if urlpattern.endswith("$"):
            urlpattern = urlpattern[:-1]
        token_pattern = r'\(\?P<(\w+)>[^)]+\)'
        ret = re.sub(token_pattern, r'{\1}', urlpattern)
        return ret

    def get_urls(self):
        from clims.api.urls import urlpatterns
        for p in urlpatterns:
            yield self.url_pattern_to_api_call(p.regex.pattern)

    def get_template(self, rel_path):
        root = os.path.dirname(resources.__file__)
        res_path = os.path.join(root, rel_path)
        with open(res_path, "r") as fs:
            template = Template(fs.read(), trim_blocks=True, lstrip_blocks=True)
            return template

    def generate(self, info):
        def _generate(root_path, template_name):
            fname = "{}.js".format(info.resource.camel)
            path = os.path.join(root_path, fname)

            templ = self.get_template(template_name)
            rendered = templ.render(**info.__dict__)
            with open(path, "w") as fs:
                fs.write(rendered)

        _generate(self.actions_path, "redux/actions.js.j2")
        _generate(self.reducers_path, "redux/reducers.js.j2")

    def generate_all(self):
        # Might: Generate from all of our urlpatterns, but for now just hardcoding these:
        infos = [
            # NOTE: This endpoint is peculiar in that we fetch single entries not by id
            # from a details endpoint, but from the list endpoint with parameters. That's why
            # we need org for the single endpoint

            # TemplateInfo(
            #     "TaskDefinition",
            #     single_parameters=["org", "processDefinitionKey", "taskDefinitionKey"],
            #     single_endpoint="/api/0/organizations/${org.slug}/task-definitions/",
            #     filter_for_single=["processDefinitionKey", "taskDefinitionKey"],
            # ),
            # TemplateInfo(
            #     "Task",
            #     list_endpoint="/api/0/organizations/${org.slug}/tasks/",
            #     list_parameters=["org", "processDefinitionKey", "taskDefinitionKey"],
            #     list_get_args=["processDefinitionKey", "taskDefinitionKey"],
            # ),
            TemplateInfo("ProcessDefinition",
                list_endpoint="/api/0/process-definitions/",
                list_parameters=[],
            )
        ]

        for info in infos:
            self.generate(info)


class Resource(object):
    def __init__(self, resource, plural_form):
        self.resource = resource
        self.resource_plural = plural_form or self.resource + "s"
        self.spinal = stringcase.constcase(resource)

        # TODO: We currently use plural for the endpoints. Consider using singular only.
        self.endpoint = stringcase.spinalcase(self.resource_plural)
        self.const = stringcase.constcase(resource)
        self.camel = stringcase.camelcase(resource)

    def __str__(self):
        return str(self.resource)


class TemplateInfo(object):
    def __init__(self,
            resource,
            single_endpoint=None,
            single_parameters=None,
            filter_for_single=None,
            list_endpoint=None,
            list_parameters=None,
            list_get_args=None,
            plural_form=None):

        self.resource = Resource(resource, plural_form)
        self.single_parameters = single_parameters or ["id"]
        self.single_signature = self.create_signature(self.single_parameters)
        self.single_endpoint = single_endpoint or "/api/0/{}/${{id}}".format(self.resource.endpoint)
        self.filter_for_single = filter_for_single or []
        self.list_endpoint = list_endpoint or "/api/0/organizations/${{org.slug}}/{}/".format(self.resource.endpoint)
        self.list_parameters = ["org"] if list_parameters is None else list_parameters
        self.list_get_args = list_get_args or []
        self.list_signature = self.create_signature(self.list_parameters)

    def create_signature(self, parameters):
        signature = ", ".join(parameters)
        if len(parameters) != 1:
            signature = "({})".format(signature)
        return signature


if __name__ == "__main__":
    g = CodeGenerator()
    g.generate_all()
