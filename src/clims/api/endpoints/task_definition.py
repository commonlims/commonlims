from __future__ import absolute_import

from sentry.api.paginator import OffsetPaginator
from sentry.api.bases.organization import OrganizationEndpoint


class TaskDefinitionEndpoint(OrganizationEndpoint):
    def get(self, request, organization):
        process_definition_key = request.GET.get('processDefinitionKey', None)
        task_definition_key = request.GET.get('taskDefinitionKey', None)

        task_definitions = self.app.workflows.get_task_definitions(
            process_definition_key=process_definition_key,
            task_definition_key=task_definition_key)

        def py_to_js(name):
            elements = name.split("_")
            ret = list(elements[0])
            for element in elements[1:]:
                ret.append(element.capitalize())
            return "".join(ret)

        def serialize(entries):
            # A serializer that renames e.g. process__name to processName.
            # TODO: Remove in favor of the django plugin that does this
            # for every serializer (CLIMS-325)
            def rename_keys(entry):
                new_entry = dict()
                for key in entry:
                    new_key = py_to_js(key)
                    new_entry[new_key] = entry[key]
                return new_entry

            entries = [rename_keys(entry) for entry in entries]
            return entries

        return self.paginate(
            request=request,
            queryset=task_definitions,
            paginator_cls=OffsetPaginator,
            on_results=lambda entry: serialize(entry),
        )
