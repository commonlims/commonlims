from __future__ import absolute_import

from rest_framework import serializers


class WorkUnitSerializer(serializers.Serializer):
    id = serializers.CharField(source="flexible_id")
    tracked_object_global_id = serializers.SerializerMethodField(required=False)
    external_work_unit_id = serializers.CharField(allow_null=True, required=False)
    external_workflow_instance_id = serializers.CharField(allow_null=True, required=False)
    workflow_provider = serializers.CharField()
    work_type = serializers.CharField()

    def get_tracked_object_global_id(self, obj):
        return obj.tracked_object_global_id
