from __future__ import absolute_import

from sentry.api.serializers import Serializer, register
from sentry.models.sample import Sample


@register(Sample)
class SampleSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        return obj.all().values()
