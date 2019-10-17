from __future__ import absolute_import

from rest_framework import serializers
from clims.models import OrganizationFile


class OrganizationFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationFile
        fields = '__all__'
