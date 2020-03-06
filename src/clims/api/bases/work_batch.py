

from sentry.api.bases.organization import OrganizationPermission, Endpoint


# Currently WorkBatch permissions are only on the organization level,
# but can easily be made more specific (see e.g. ./user.py)
class WorkBatchPermission(OrganizationPermission):
    pass


class WorkBatchBaseEndpoint(Endpoint):
    permission_classes = (WorkBatchPermission, )
