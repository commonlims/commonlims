from __future__ import absolute_import
from rest_framework import serializers


class WorkBatchSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)
    cls_full_name = serializers.CharField(read_only=True)
