from __future__ import absolute_import

from rest_framework import serializers


class ScriptTriggerSerializer(serializers.Serializer):
    name = serializers.CharField()
    event_type = serializers.CharField()
    event_tag = serializers.CharField()
