from __future__ import absolute_import

from rest_framework import serializers


class ValidationIssueSerializer(serializers.Serializer):
    type = serializers.CharField()
    msg = serializers.CharField()
    column = serializers.CharField()
    row = serializers.CharField()
    file = serializers.CharField()
    object_id = serializers.CharField()
