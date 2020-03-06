

from sentry.api.exceptions import ResourceDoesNotExist


def get_environments(request, organization):
    from sentry.models import Environment  # Django 1.9 setup issue
    requested_environments = set(request.GET.getlist('environment'))

    if not requested_environments:
        return []

    environments = list(Environment.objects.filter(
        organization_id=organization.id,
        name__in=requested_environments,
    ))

    if set(requested_environments) != set([e.name for e in environments]):
        raise ResourceDoesNotExist

    return environments
