from __future__ import absolute_import

from clims.api.serializers.models.extensible_property import ExtensiblePropertySerializer

from rest_framework import serializers
from rest_framework.fields import DictField
from six import text_type


class ContainerIndexField(serializers.Field):
    def to_representation(self, value):
        return {
            "index": text_type(value)
        }


class LocationField(serializers.Field):
    def to_representation(self, obj):
        # TODO: We are currently returning the raw index, but the user should get the
        # __repr__ version of the index which makes sense for the particular container, e.g.
        # a1 for a regular plate.
        return {
            "index": "({}, {}, {})".format(obj.x, obj.y, obj.z),
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
    container_index = ContainerIndexField(read_only=True)
    global_id = serializers.CharField(read_only=True)
