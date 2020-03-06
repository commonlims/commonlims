

__all__ = ['PluginProjectEndpoint', 'PluginGroupEndpoint']

from rest_framework.response import Response

from sentry.api.bases.group import GroupEndpoint
from sentry.api.bases.project import ProjectEndpoint


class PluginProjectEndpoint(ProjectEndpoint):
    plugin = None
    view = None

    def _handle(self, request, project, *args, **kwargs):
        if self.view is None:
            return Response(status=405)
        return self.view(request, project, *args, **kwargs)

    def get(self, request, project, *args, **kwargs):
        return self._handle(request, project, *args, **kwargs)

    def post(self, request, project, *args, **kwargs):
        return self._handle(request, project, *args, **kwargs)

    def respond(self, *args, **kwargs):
        return Response(*args, **kwargs)


class PluginGroupEndpoint(GroupEndpoint):
    plugin = None
    view = None

    def _handle(self, request, group, *args, **kwargs):
        from sentry.models import GroupMeta  # Django 1.9 setup issue
        if self.view is None:
            return Response(status=405)

        GroupMeta.objects.populate_cache([group])

        return self.view(request, group, *args, **kwargs)

    def get(self, request, group, *args, **kwargs):
        return self._handle(request, group, *args, **kwargs)

    def post(self, request, group, *args, **kwargs):
        return self._handle(request, group, *args, **kwargs)

    def respond(self, *args, **kwargs):
        return Response(*args, **kwargs)
