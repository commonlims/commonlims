from __future__ import absolute_import

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from sentry.api.base import DEFAULT_AUTHENTICATION
from sentry.api.paginator import OffsetPaginator
from sentry.api.bases.organization import OrganizationEndpoint
from clims.api.serializers.models.substance import SubstanceSerializer


class SubstanceEndpoint(OrganizationEndpoint):
    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )

    def get(self, request, organization):
        # TODO: Filter by the organization
        search_string = request.GET.get('search', None)
        queryset = self.app.substances.search(search_string)

        return self.paginate(
            request=request,
            queryset=queryset,
            paginator_cls=OffsetPaginator,
            default_per_page=20,
            on_results=lambda data: SubstanceSerializer(data, many=True).data)

    def post(self, request, organization):
        # TODO: Add user info to all actions
        validator = SubstanceSerializer(data=request.data)
        if not validator.is_valid():
            return self.respond(validator.errors, status=400)

        validated = validator.validated_data
        substance = self.app.extensibles.create(
            validated['name'],
            validated['type_full_name'],
            organization,
            validated.get('properties', None))
        ret = {"id": substance.id}

        return Response(ret, status=status.HTTP_201_CREATED)
