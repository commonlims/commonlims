from __future__ import absolute_import

import six
from rest_framework.response import Response

from sentry.api.bases import OrganizationEventsEndpointBase, OrganizationEventsError, NoProjects
from sentry.api.paginator import SequencePaginator
from sentry.api.serializers import serialize
from sentry.tagstore.base import TAG_KEY_RE
from sentry.tagstore.snuba.backend import SnubaTagStorage


class OrganizationTagKeyValuesEndpoint(OrganizationEventsEndpointBase):

    def get(self, request, organization, key):
        if not TAG_KEY_RE.match(key):
            return Response({'detail': 'Invalid tag key format for "%s"' % (key,)}, status=400)

        try:
            filter_params = self.get_filter_params(request, organization)
        except OrganizationEventsError as exc:
            return Response({'detail': six.text_type(exc)}, status=400)
        except NoProjects:
            paginator = SequencePaginator([])
        else:
            # TODO(jess): update this when snuba tagstore is the primary backend for us
            tagstore = SnubaTagStorage()

            paginator = tagstore.get_tag_value_paginator_for_projects(
                filter_params['project_id'],
                filter_params.get('environment'),
                key,
                filter_params['start'],
                filter_params['end'],
                query=request.GET.get('query'),
            )

        return self.paginate(
            request=request,
            paginator=paginator,
            on_results=lambda results: serialize(results, request.user),
        )

# TODO: Remove WorkBatch from name!


class OrganizationWorkBatchPropertiesKeyValuesEndpoint(OrganizationEventsEndpointBase):

    def get(self, request, organization, type_name, prop):
        # TODO: We could implement limiting the property value further to when it was set
        # TODO: Use the version too
        # TODO: Distinct
        from clims.models import PropertyInstance, PropertyType, ExtensibleType

        work_batch_type = ExtensibleType.objects.get(name="WorkBatch")
        counter = PropertyType.objects.get(name="counter", extensible_type=work_batch_type)
        objs = PropertyInstance.objects.filter(property_type=counter, float_value=100.0)
        data = []

        # TODO: paginate
        for obj in objs:
            data.append({
                "value": "{}".format(obj.value)
            })
        return Response(data)
