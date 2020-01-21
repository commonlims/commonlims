from __future__ import absolute_import

from sentry.api.bases.organization import OrganizationEndpoint
from sentry.api.base import DocSection
from rest_framework.response import Response
from sentry.api.serializers import serialize
from sentry.api.exceptions import ResourceDoesNotExist


class WorkBatchSettingsEndpoint(OrganizationEndpoint):
    doc_section = DocSection.ORGANIZATIONS

    def get(self, request, organization):
        ret = self.app.plugins.all_work_batches()
        return Response(serialize(ret))


class WorkBatchSettingsDetailsEndpoint(OrganizationEndpoint):
    def get(self, request, organization, work_batch_type):
        if work_batch_type not in self.app.plugins.handlers_mapped_by_work_batch_type:
            raise ResourceDoesNotExist()
        ret = self.app.plugins.handlers_mapped_by_work_batch_type[work_batch_type]
        return Response(serialize(ret))
