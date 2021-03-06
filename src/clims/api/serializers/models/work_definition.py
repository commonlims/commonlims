from __future__ import absolute_import

from rest_framework import serializers


class WorkDefinitionSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField()
    processDefinitionName = serializers.CharField(source="process_definition_name")
    processDefinitionKey = serializers.CharField(source="process_definition_key")
    workDefinitionKey = serializers.CharField(source="work_definition_key")
    count = serializers.IntegerField()
