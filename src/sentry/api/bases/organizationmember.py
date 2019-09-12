from __future__ import absolute_import

from django.db.models import Q

from sentry.api.exceptions import ResourceDoesNotExist

from .organization import OrganizationEndpoint


class OrganizationMemberEndpoint(OrganizationEndpoint):
    def convert_args(self, request, organization_slug, member_id='me', *args, **kwargs):
        from sentry.models import OrganizationMember  # Django 1.9 setup issue
        args, kwargs = super(OrganizationMemberEndpoint,
                             self).convert_args(request, organization_slug)

        try:
            kwargs['member'] = self._get_member(request, kwargs['organization'], member_id)
        except OrganizationMember.DoesNotExist:
            raise ResourceDoesNotExist

        return (args, kwargs)

    def _get_member(self, request, organization, member_id):
        from sentry.models import OrganizationMember  # Django 1.9 setup issue
        if member_id == 'me':
            queryset = OrganizationMember.objects.filter(
                organization=organization,
                user__id=request.user.id,
                user__is_active=True,
            )
        else:
            queryset = OrganizationMember.objects.filter(
                Q(user__is_active=True) | Q(user__isnull=True),
                organization=organization,
                id=member_id,
            )
        return queryset.select_related('user').get()
