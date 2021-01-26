from __future__ import absolute_import
from rest_framework import serializers
from rest_framework.fields import DictField
from clims.api.serializers.models.extensible_property import ExtensiblePropertySerializer


class WorkBatchDetailsSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)
    properties = DictField(child=ExtensiblePropertySerializer(), allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    cls_full_name = serializers.CharField(read_only=True)

    # These are still mocked
    transitions = serializers.SerializerMethodField(read_only=True)
    substances = serializers.SerializerMethodField(read_only=True)
    containers = serializers.SerializerMethodField(read_only=True)
    tabs = serializers.SerializerMethodField(read_only=True)

    def update(self, instance, validated_data):
        if validated_data['properties'] is None:
            return instance
        for p in validated_data['properties']:
            setattr(instance, p, validated_data['properties'][p]['value'])
        instance.save()
        return instance

    # TODO: These are mocked for now
    def get_transitions(self, obj):
        return [
            {'source': 1, 'target': 3, 'type': 'spawn'}  # Substance 1 transitions to substance 3
        ]

    def get_containers(self, obj):
        return {
            'source': [9],
            'target': [10]
        }

    def get_substances(self, obj):
        return [1, 3]

    def get_tabs(self, obj):
        return [
            {'title': 'Move samples', 'active': True, 'id': 1, 'key': 'transition'},
            {'title': 'Files', 'active': False, 'id': 2, 'key': 'files'},
            {'title': 'Details', 'active': False, 'id': 3, 'key': 'details'},
            {'title': 'Comments', 'active': False, 'id': 4, 'key': 'comments'},
        ]
