from __future__ import absolute_import

from sentry.api.bases import OrganizationIssuesEndpoint
from sentry.models import Group, OrganizationMemberTeam, Team
from clims.models import UserTask
from django.db.models import Q

# TODO: Relation between UserTask and

# NOTE: We can keep the name "Issue" even though this returns all UserTasks now
# which aren't necessarily issues.


class OrganizationMemberIssuesAssignedEndpoint(OrganizationIssuesEndpoint):
    def get_queryset(self, request, organization, member, project_list):
        teams = Team.objects.filter(
            id__in=OrganizationMemberTeam.objects.filter(
                organizationmember=member,
                is_active=True,
            ).values('team')
        )

        return UserTask.objects.filter(
            Q(assignee_set__user=member.user) |
            Q(assignee_set__team__in=teams)
        ).extra(
            select={'sort_by': 'sentry_usertaskasignee.date_added'},
        ).order_by('-sort_by')
