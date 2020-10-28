from __future__ import absolute_import

from rest_framework import serializers


class EventSerializer(serializers.Serializer):
    full_name = serializers.CharField()
    event_type = serializers.CharField()
    event_tag = serializers.CharField()
