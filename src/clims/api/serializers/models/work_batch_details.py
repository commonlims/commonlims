from __future__ import absolute_import
from rest_framework import serializers
from rest_framework.fields import DictField
from clims.api.serializers.models.extensible_property import ExtensiblePropertySerializer


class WorkBatchDetailsSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)
