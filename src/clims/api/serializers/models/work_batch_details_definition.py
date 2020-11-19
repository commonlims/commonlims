from __future__ import absolute_import
from rest_framework import serializers


class ButtonField(serializers.Field):
    def to_representation(self, value):
        return {
            "event": value.name,
            "caption": value.caption,
        }


class FieldPropertyField(serializers.Field):
    def to_representation(self, value):
        return {
            "type": value.type,
            "caption": value.caption,
            "prop_name": value.prop_name,
        }


class WorkBatchDetailsDefinitionSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True, source='cls_full_name')
    cls_full_name = serializers.CharField(read_only=True)
    name = serializers.CharField(read_only=True)
    buttons = serializers.ListField(child=ButtonField(), read_only=True)
    fields = serializers.ListField(child=FieldPropertyField(), read_only=True)
