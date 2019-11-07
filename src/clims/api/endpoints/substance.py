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
        query = request.GET.get('query', None)
        queryset = self.app.substances._search_qs(query)

        # Temporarily sort by date
        queryset = queryset.order_by('-archetype__created_at')

        def handle_results(qs):
            ret = list()
            # NOTE: This could be simplified substantially if we had a queryset that returned
            # the wrapper object directly.
            import random
            for entry in qs:
                wrapper = self.app.substances.to_wrapper(entry)
                json = SubstanceSerializer(wrapper).data
                json['position'] = {'index': "A:1",
                        'container':
                            {'name': random.choice(["container 1", "container 2", "container 3"])
                    }
                }
                ret.append(json)
            return ret

        return self.paginate(
            request=request,
            queryset=queryset,
            paginator_cls=OffsetPaginator,
            default_per_page=25,
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
