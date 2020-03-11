from __future__ import absolute_import

from rest_framework.response import Response

from sentry.api.base import Endpoint, SessionAuthentication
from rest_framework.permissions import IsAuthenticated


class PluginActionsEndpoint(Endpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def get(self, request, organization_slug, plugin_id):
        # TODO: List actions (we don't need it for now though)
        obj = {"id": 10}
        return Response([obj])

    def post(self, request, organization_slug, plugin_id):
        correlation = request.data
        plugin = self.app.plugins.get(correlation["plugin"])
        plugin.handle_event(correlation["handler"], correlation["method"], request.data)

        return Response({}, 201)
