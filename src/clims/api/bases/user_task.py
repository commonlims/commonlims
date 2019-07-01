from __future__ import absolute_import

from sentry.api.bases.organization import OrganizationPermission, Endpoint


# Currently UserTask permissions are only on the organization level,
# but can easily be made more specific (see e.g. ./user.py)
class UserTaskPermission(OrganizationPermission):
    pass


class UserTaskBaseEndpoint(Endpoint):
    permission_classes = (UserTaskPermission, )