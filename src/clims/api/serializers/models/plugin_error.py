

from rest_framework import serializers
from clims.api.serializers.models.validation_issue import ValidationIssueSerializer


class PluginErrorSerializer(serializers.Serializer):
    detail = serializers.CharField(source='message')
    validationIssues = serializers.ListField(source='validation_issues',
        child=ValidationIssueSerializer()
    )
