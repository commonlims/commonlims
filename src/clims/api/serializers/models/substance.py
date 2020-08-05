from __future__ import absolute_import

from clims.api.serializers.models.extensible_property import ExtensiblePropertySerializer

from rest_framework import serializers
from rest_framework.fields import DictField


class LocationField(serializers.Field):
    def to_representation(self, obj):
        return {
            "index": repr(obj),
            "container": {
                "name": obj.container.name
            }
        }


class SubstanceSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    version = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    properties = DictField(child=ExtensiblePropertySerializer(read_only=True))
    type_full_name = serializers.CharField()
    location = LocationField(read_only=True)
    global_id = serializers.CharField(read_only=True)
