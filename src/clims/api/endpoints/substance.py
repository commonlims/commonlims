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
        queryset = self.app.substances.all_qs()

        def handle_results(qs):
            ret = list()
            # NOTE: This could be simplified substantially if we had a queryset that returned
            # the wrapper object directly.
            for entry in qs:
                wrapper = self.app.substances.to_wrapper(entry)
                json = SubstanceSerializer(wrapper).data
                json['position'] = {'index': "A:1", 'container': {'name': "cont1"}}
                if 'volume' not in json['properties']:
                    json['properties']['volume'] = 10
                if 'sample_type' not in json['properties']:
                    json['properties']['sample_type'] = 'amplicon'
                if 'priority' not in json:
                    json['priority'] = 3
                if 'days_waiting' not in json:
                    json['days_waiting'] = 56   # NOTE: We would have created and origin_created instead
                ret.append(json)
            return ret

        return self.paginate(
            request=request,
            queryset=queryset,
            paginator_cls=OffsetPaginator,
            on_results=lambda data: handle_results(data))

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
