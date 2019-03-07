from __future__ import absolute_import

from sentry.api.serializers import Serializer, register
from sentry.models.sample import Sample
from django.forms.models import model_to_dict


@register(Sample)
class SampleSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        if isinstance(obj, Sample):
            return model_to_dict(obj)
        else:
            return obj.all().values()
