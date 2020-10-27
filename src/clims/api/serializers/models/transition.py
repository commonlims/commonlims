from __future__ import absolute_import
from rest_framework import serializers
from clims.models.transition import TransitionType


class LocationSerializer(serializers.Serializer):
    container_id = serializers.IntegerField()
    x = serializers.IntegerField()
    y = serializers.IntegerField()
    z = serializers.IntegerField()


class TransitionSerializer(serializers.Serializer):
    source_location_id = serializers.IntegerField()
    target_location = LocationSerializer()
    transition_type = serializers.IntegerField()

    def validate_transition_type(self, value):
        if not TransitionType.valid(value):
            raise serializers.ValidationError("Invalid transition type")
        return value
