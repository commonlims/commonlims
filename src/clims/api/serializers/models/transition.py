from __future__ import absolute_import

from clims.models.transition import Transition
from rest_framework import serializers as django_serializers


class TransitionSerializer(django_serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = Transition
