from __future__ import absolute_import

from sentry.api.serializers import Serializer, register
from clims.models.sample import Sample
import six


@register(Sample)
class SampleSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        return {
            "id": six.text_type(obj.id),
            "name": obj.name,
            # "processes": obj.processes,

            # Test stuff
            "userCount": 12,
            "position": "A:1",
            "hasSeen": True,
            "project": {
                "slug": 'internal',
                "id": obj.project.id if obj.project else None,
                "name": 'internal',
            },
            "container": 'RC-0123-Hund',
        }
