from __future__ import absolute_import

# class OrganizationActivityEndpoint(OrganizationMemberEndpoint, EnvironmentMixin):
#     def get(self, request, organization, member):
#         queryset = Activity.objects.filter(
#             project__in=Project.objects.filter(
#                 organization=organization,
#                 teams__in=OrganizationMemberTeam.objects.filter(
#                     organizationmember=member,
#                 ).values('team')
#             )
#         ).exclude(
#             # There is an activity record created for both sides of the unmerge
#             # operation, so we only need to include one of them here to avoid
#             # showing the same entry twice.
#             type=Activity.UNMERGE_SOURCE,
#         ).select_related('project', 'group', 'user')

#         return self.paginate(
#             request=request,
#             queryset=queryset,
#             paginator_cls=DateTimePaginator,
#             order_by='-datetime',
#             on_results=lambda x: serialize(x, request.user, OrganizationActivitySerializer(
#                 environment_func=self._get_environment_func(
#                     request, organization.id)
#             )),
#         )
