

from clims.api.serializers.models.extensible_property import ExtensiblePropertySerializer
from clims.api.serializers.models.substance import SubstanceSerializer

from rest_framework import serializers
from rest_framework.fields import DictField


class ContainerSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    version = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    properties = DictField(child=ExtensiblePropertySerializer(read_only=True))
    type_full_name = serializers.CharField()


class ContainerExpandedSerializer(ContainerSerializer):
    contents = SubstanceSerializer(many=True)
