from __future__ import absolute_import
from rest_framework import serializers
from clims.models.transition import TransitionType


class PositionSerializer(serializers.Serializer):
    container_id = serializers.IntegerField()
    index = serializers.CharField()


class TransitionSerializer(serializers.Serializer):
    source_position = PositionSerializer()
    target_position = PositionSerializer()
    type = serializers.CharField()

    def validate_transition_type(self, value):
        if not TransitionType.valid(value):
            raise serializers.ValidationError("Invalid transition type")
        return value


class TransitionBatchSerializer(serializers.Serializer):
    transitions = serializers.ListField(
        child=TransitionSerializer()
    )
