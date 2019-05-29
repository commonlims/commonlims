
from __future__ import absolute_import

from clims.models.user_task import UserTask

from rest_framework import serializers as django_serializers


class UserTaskSerializer(django_serializers.ModelSerializer):
    class Meta:
        model = UserTask
