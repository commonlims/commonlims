from __future__ import absolute_import

from rest_framework.response import Response
from sentry.api.bases.work_batch import WorkBatchBaseEndpoint
from sentry.api.bases import OrganizationEndpoint
from clims.models import WorkBatch
from sentry.models.activity import Activity
from sentry.api.serializers import serialize
from sentry.api.paginator import OffsetPaginator


class WorkBatchEndpoint(OrganizationEndpoint):

    def get(self, request, organization):
        work_batches = WorkBatch.objects.filter(organization=organization)
        return self.paginate(
            request=request,
            queryset=work_batches,
            paginator_cls=OffsetPaginator,
            on_results=lambda x: serialize(x),
        )

    def post(self, request):
        return Response([], status=201)


class WorkBatchDetailsEndpoint(WorkBatchBaseEndpoint):

    def _get_activity(self, request, work_batch, num):
        activity_items = set()
        activity = []
        activity_qs = Activity.objects.filter(
            work_batch=work_batch,
        ).order_by('-datetime').select_related('user')
        # we select excess so we can filter dupes
        for item in activity_qs[:num * 2]:
            sig = (item.type, item.ident, item.user_id)
            # TODO: we could just generate a signature (hash(text)) for notes
            # so there's no special casing
            if item.type == Activity.NOTE:
                activity.append(item)
            elif sig not in activity_items:
                activity_items.add(sig)
                activity.append(item)

        activity.append(
            Activity(
                id=0,
                work_batch=work_batch,
                type=Activity.FIRST_SEEN,
                datetime=work_batch.created,
            )
        )

        return activity[:num]

    def get(self, request, work_batch_id):
        work_batch = WorkBatch.objects.get(pk=work_batch_id)

        # activity = self._get_activity(request, work_batch, num=100)

        return Response(serialize(work_batch), status=200)
