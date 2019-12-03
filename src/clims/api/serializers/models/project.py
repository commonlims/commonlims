from __future__ import absolute_import

from clims.api.serializers.models.extensible_property import ExtensiblePropertySerializer

from rest_framework import serializers
from rest_framework.fields import DictField


class ProjectSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    version = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    properties = DictField(child=ExtensiblePropertySerializer(read_only=True))
    type_full_name = serializers.CharField()
