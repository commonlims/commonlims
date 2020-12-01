from __future__ import absolute_import

from clims.models.transition import Transition
from rest_framework import serializers
from clims.models.location import SubstanceLocation
from clims.services.application import ioc


# "sourcePosition": {
#         "containerId": cont1.id,
#         "index": "a1"
# },


# class LocationField(serializers.Field):
#     def get_container(self, container_id):
#         """
#         Get's the container from the backend, or a cached
#         version (in the serializer context) if it exists
#         """
#         if "containers" not in self.context:
#             self.context["containers"] = dict()

#         if container_id not in self.context["containers"]:
#             container = ioc.app.containers.get(id=container_id)
#             self.context["containers"][container_id] = container
#         return self.context["containers"][container_id]

#     def to_representation(self, value):
#         # TODO
#         return "lets make stuff"

#     def to_internal_value(self, data):
#         container_id = data["container_id"]
#         index = data["index"]
#         container = self.get_container(container_id)
#         ret = SubstanceLocation()
#         validated_index = container._key_to_index(index)

#         # NOTE: This is a lot of underlying details that should
#         # preferably be hidden from serializers, e.g. by wrapping
#         # the SubstanceLocation model
#         ret.container = container._archetype
#         ret.container_version = container._wrapped_version

#         # Validate the index using the container:

#         return ret


class PositionField(serializers.Field):
    id = serializers.IntegerField()
    index = serializers.CharField()

    def to_internal_value(self, data):
        return data


class TransitionSerializer(serializers.Serializer):
    type = serializers.CharField()
    source_position = PositionField()
    target_position = PositionField()
