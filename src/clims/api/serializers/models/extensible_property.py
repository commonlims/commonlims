
from __future__ import absolute_import

from rest_framework import serializers


class ExtensiblePropertySerializer(serializers.Serializer):
    name = serializers.CharField(read_only=True)
    value = serializers.CharField()
