from __future__ import absolute_import
from rest_framework import serializers
from rest_framework.fields import DictField
from clims.api.serializers.models.extensible_property import ExtensiblePropertySerializer


class WorkBatchDetailsSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)
    properties = DictField(child=ExtensiblePropertySerializer(), allow_null=True)

    def update(self, instance, validated_data):
        if validated_data['properties'] is None:
            return instance
        for p in validated_data['properties']:
            setattr(instance, p, validated_data['properties'][p]['value'])
        instance.save()
        return instance
