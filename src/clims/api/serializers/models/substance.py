from __future__ import absolute_import

from clims.models.substance import Substance
from rest_framework import serializers
from rest_framework.fields import Field


class PropertyValueField(Field):
    def to_representation(self, obj):
        return obj

    def to_internal_value(self, data):
        return data


class PropertyTypeSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)


class PropertyOverviewSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    type = PropertyTypeSerializer()
    value = PropertyValueField()


class PropertiesField(Field):
    def to_representation(self, obj):
        return {key: prop.value for key, prop in obj.items()}

    def to_internal_value(self, data):
        # TODO
        return data


class VersionField(Field):
    def to_representation(self, obj):
        return obj


class SubstanceSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    version = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    properties = PropertiesField()
    type_full_name = serializers.CharField()

    def create(self, validated_data):
        return Substance.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.save()

        return instance
