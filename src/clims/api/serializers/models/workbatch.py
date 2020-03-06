from clims.models.work_batch import WorkBatch

from rest_framework import serializers as django_serializers


class WorkBatchSerializer(django_serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = WorkBatch
