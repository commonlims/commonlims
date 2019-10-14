from __future__ import absolute_import

from clims.models.substance import Substance
from clims.api.serializers.models.extensible_property import ExtensiblePropertySerializer

from rest_framework import serializers
from rest_framework.fields import DictField


class SubstanceSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    version = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    properties = DictField(child=ExtensiblePropertySerializer(read_only=True))
    type_full_name = serializers.CharField()

    def create(self, validated_data):
        return Substance.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.save()

        return instance
