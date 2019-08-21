from __future__ import absolute_import

from rest_framework.response import Response

from sentry.api.base import EnvironmentMixin
from sentry.api.paginator import OffsetPaginator

from .organizationmember import OrganizationMemberEndpoint

ERR_INVALID_STATS_PERIOD = "Invalid stats_period. Valid choices are '', '24h', and '14d'"


class OrganizationIssuesEndpoint(OrganizationMemberEndpoint, EnvironmentMixin):
    def get_queryset(self, request, organization, member, project_list):
        # Must return a 'sorty_by' selector for pagination that is a datetime
        from clims.models import WorkBatch  # Django 1.9 setup issue
        return WorkBatch.objects.none()

    def get(self, request, organization, member):
        """
        Return a list of issues assigned to the given member.
        """
        from sentry.api.serializers import serialize  # Django 1.9 setup issue
        from clims.models import WorkBatchStatus  # Django 1.9 setup issue
        queryset = self.get_queryset(request, organization, member, [])
        status = request.GET.get('status', 'unresolved')
        if status == 'unresolved':
            queryset = queryset.filter(
                status=WorkBatchStatus.UNRESOLVED,
            )
        elif status:
            return Response({'status': 'Invalid status choice'}, status=400)

        def on_results(results):
            results = serialize(results, request.user)

            # TODO!
            if request.GET.get('status') == 'unresolved':
                results = [r for r in results if r['status'] == 'unresolved']

            return results

        return self.paginate(
            request=request,
            queryset=queryset,
            order_by='-sort_by',
            paginator_cls=OffsetPaginator,
            on_results=on_results,
        )
