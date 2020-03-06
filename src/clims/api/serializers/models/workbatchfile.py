

import six

from sentry.api.serializers import Serializer, register
from clims.models import WorkBatchFile


@register(WorkBatchFile)
class WorkBatchFileSerializer(Serializer):
    # TODO Change this to use django seralizer. See WorkBatchSerializer. /JD 2019-05-29
    def serialize(self, obj, attrs, user):
        return {
            'id': six.text_type(obj.id),
            'name': obj.name,
            'headers': obj.file.headers,
            'size': obj.file.size,
            'sha1': obj.file.checksum,
            'dateCreated': obj.file.timestamp,
        }
