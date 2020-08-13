from __future__ import absolute_import
from rest_framework import serializers


class StepSerializer(serializers.Serializer):
    name = serializers.CharField(read_only=True)
    buttons = serializers.ListField(read_only=True)
