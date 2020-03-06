

from rest_framework.response import Response

from sentry.api.bases.project import ProjectEndpoint
from sentry.api.base import SessionAuthentication
from rest_framework.permissions import IsAuthenticated


class PluginViewsEndpoint(ProjectEndpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def get(self, request, project):
        return Response([])
