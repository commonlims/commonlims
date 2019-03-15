from sentry.api.bases.organization import OrganizationEndpoint
from sentry.api.base import DocSection
from rest_framework.response import Response
from sentry.plugins import plugins
from sentry.api.serializers import serialize
from sentry.api.exceptions import ResourceDoesNotExist


class UserTaskSettingsEndpoint(OrganizationEndpoint):
    doc_section = DocSection.ORGANIZATIONS

    def get(self, request, organization):
        ret = plugins.all_user_tasks()
        return Response(serialize(ret))


class UserTaskSettingsDetailsEndpoint(OrganizationEndpoint):
    def get(self, request, organization, user_task_type):
        if user_task_type not in plugins.handlers_mapped_by_user_task_type:
            raise ResourceDoesNotExist()
        ret = plugins.handlers_mapped_by_user_task_type[user_task_type]
        return Response(serialize(ret))
