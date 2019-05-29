
from __future__ import absolute_import

from sentry.api.serializers import Serializer, register

from clims.models.user_task import UserTask

from rest_framework import serializers as django_serializers


@register(UserTask)
class UserTaskSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        s = self._UserTaskSerializer(obj)
        return s.data

    class _UserTaskSerializer(django_serializers.ModelSerializer):
        class Meta:
            model = UserTask
