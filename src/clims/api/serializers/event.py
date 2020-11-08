from __future__ import absolute_import

from rest_framework import serializers


class EventSerializer(serializers.Serializer):
    work_batch_id = serializers.CharField()
    event = serializers.CharField()
