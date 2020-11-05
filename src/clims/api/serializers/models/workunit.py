from __future__ import absolute_import

from rest_framework import serializers
from clims.api.serializers.models.substance import SubstanceSerializer


class WorkUnitSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    tracked_object = serializers.SerializerMethodField(required=False)
    external_work_unit_id = serializers.CharField(allow_null=True, required=False)
    external_workflow_instance_id = serializers.CharField(allow_null=True, required=False)
    workflow_provider = serializers.CharField()
    work_type = serializers.CharField()

    def get_tracked_object(self, obj):
        print("ME HERE", obj.tracked_object, type(obj.tracked_object))
        return SubstanceSerializer(obj.tracked_object).data
