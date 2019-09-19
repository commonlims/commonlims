from __future__ import absolute_import

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from sentry.api.base import DEFAULT_AUTHENTICATION
from clims.models import Substance, ExtensibleProperty
from sentry.api.paginator import OffsetPaginator
from sentry.api.bases.organization import OrganizationEndpoint
from clims.api.serializers.models.substance import SubstanceSerializer
from django.db.models import Prefetch
from clims.services import substances


class SubstanceEndpoint(OrganizationEndpoint):
    authentication_classes = DEFAULT_AUTHENTICATION
    permission_classes = (IsAuthenticated, )  # TODO

    # TODO: The index endpoint must be on sample level!
    def get(self, request, organization):
        # TODO: Add version as query parameter
        # Prefetch the latest properties on the object
        prefetch = Prefetch(
            'properties',
            queryset=ExtensibleProperty.objects.filter(latest=True))

        queryset = Substance.objects.all().prefetch_related(prefetch)

        return self.paginate(
            request=request,
            queryset=queryset,
            paginator_cls=OffsetPaginator,
            on_results=lambda x: SubstanceSerializer(x, many=True).data,
        )

    def post(self, request, organization):
        # TODO: Add user info to all actions
        validator = SubstanceSerializer(data=request.data)
        if not validator.is_valid():
            return self.respond(validator.errors, status=400)

        validated = validator.validated_data

        properties = validated.get('properties', None)
        substance = substances.create(validated['name'],
            validated['extensible_type'], organization, properties=properties)
        ret = {"id": substance.id}

        return Response(ret, status=status.HTTP_201_CREATED)
