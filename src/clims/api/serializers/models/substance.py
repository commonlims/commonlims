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
        ret = dict()
        for prop in obj.filter(latest=True):
            prop_type = prop.extensible_property_type
            display_name = prop_type.display_name if prop_type.display_name else prop_type.name
            ret[prop_type.name] = dict(value=prop.value, display_name=display_name)
        return ret

    def to_internal_value(self, data):
        return data


class VersionField(Field):
    def to_representation(self, obj):
        return obj


class ExtensibleTypeField(Field):
    def to_representation(self, obj):
        return "{}.substances.{}".format(obj.plugin.name, obj.name)

    def to_internal_value(self, data):
        return data


class SubstanceSerializer(serializers.Serializer):

    id = serializers.IntegerField(read_only=True)
    version = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    properties = PropertiesField()
    extensible_type = ExtensibleTypeField()

    def create(self, validated_data):
        return Substance.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.save()

        return instance
