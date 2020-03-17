from __future__ import absolute_import

from rest_framework import serializers


class TaskSerializer(serializers.Serializer):
    id = serializers.CharField()
    tracked_object = serializers.SerializerMethodField()
