from __future__ import absolute_import

from sentry.api.serializers import Serializer, register
from sentry.models.sample import Sample


@register(Sample)
class SampleSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        return {
            "id": str(obj.id),
            "name": obj.name,
            "processes": obj.processes,

            # Test stuff
            "userCount": 12,
            "position": "A:1",
            "hasSeen": True,
            "project": {
                "slug": 'rc-0123',
                "id": obj.project.id if obj.project else None,
                "name": 'RC-0123',
            },
            "container": 'RC-0123-Hund',
        }
