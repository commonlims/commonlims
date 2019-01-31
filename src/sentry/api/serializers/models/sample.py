from __future__ import absolute_import

from sentry.api.serializers import Serializer, register
from clims.models.sample import Sample

# NOLIMS: Move to clims. NOTE: The autoregister thing probably needs to be configured for that...


@register(Sample)
class SampleSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        return {
            "id": obj.id,
            "name": obj.name,
            # "project": obj.project.id  # TODO: link
        }
