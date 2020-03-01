from __future__ import absolute_import

import os

from clims.devhelpers import resources
import re
from jinja2 import Template
import stringcase

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

    def list_endpoint(self, url):
        # A list endpoint should support getting all instances and creating a new:
        pass

    def get_template(self, rel_path):
        root = os.path.dirname(resources.__file__)
        res_path = os.path.join(root, rel_path)
        with open(res_path, "r") as fs:
            template = Template(fs.read(), trim_blocks=True, lstrip_blocks=True)
            return template

    def generate(self,
            resource,
            single_endpoint,
            single_parameters,
            filter_for_single,
            list_endpoint,
            list_parameters,
            ):
        list_templ = self.get_template("redux/actions.js.j2")
        resource_const = stringcase.constcase(resource)

        rendered = list_templ.render(
            resource=resource,
            resource_const=resource_const,
            single_endpoint=single_endpoint,
            single_parameters=single_parameters,
            filter_for_single=filter_for_single,
            list_endpoint=list_endpoint,
            list_parameters=list_parameters,
        )
        return rendered

    def generate_all(self):
        # Might: Generate from all of our urlpatterns, but for now just hardcoding these:
        gen_list = [{
            "resource": "TaskDefinition",
            "single_endpoint": "/api/0/organizations/${org.slug}/workflow/aggregate/task/",
            "single_parameters": ["org", "processDefinitionKey", "taskDefinitionKey"],
            "filter_for_single": ["processDefinitionKey", "taskDefinitionKey"],
            "list_endpoint": "/api/0/organizations/${org.slug}/workflow/aggregate/task/",
            "list_parameters": ["org"],
        }]

        for gen_info in gen_list:
            rendered = self.generate(**gen_info)
            actions_file = "{}.js".format(stringcase.camelcase(gen_info["resource"]))
            fpath = os.path.join(self.actions_path, actions_file)
            with open(fpath, "w") as fs:
                fs.write(rendered)


if __name__ == "__main__":
    g = CodeGenerator()
    g.generate_all()
