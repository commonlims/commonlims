from __future__ import absolute_import, division

from django.http import Http404, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from sudo.utils import is_safe_url

from clims.services import ioc
from sentry.models import Group, GroupMeta
from sentry.web.frontend.base import ProjectView


class GroupPluginActionView(ProjectView):
    required_scope = 'event:read'

    def handle(self, request, organization, project, group_id, slug):
        group = get_object_or_404(Group, pk=group_id, project=project)

        try:
            plugin = ioc.app.plugins.get(slug)
        except KeyError:
            raise Http404('Plugin not found')

        GroupMeta.objects.populate_cache([group])

        response = plugin.get_view_response(request, group)
        if response:
            return response

        redirect = request.META.get('HTTP_REFERER', '')
        if not is_safe_url(redirect, host=request.get_host()):
            redirect = u'/{}/{}/'.format(
                organization.slug,
                group.project.slug,
            )
        return HttpResponseRedirect(redirect)
