from __future__ import absolute_import

from rest_framework import serializers
from rest_framework.serializers import Serializer, ValidationError

from sentry.models import ApiScopes
from sentry.models.sentryapp import VALID_EVENT_RESOURCES, REQUIRED_EVENT_PERMISSIONS


class ApiScopesField(serializers.Field):
    def validate(self, data):
        valid_scopes = ApiScopes()
        if data is None:
            raise ValidationError('Must provide scopes')

        for scope in data:
            if scope not in valid_scopes:
                raise ValidationError(u'{} not a valid scope'.format(scope))

    def to_internal_value(self, data):
        return data


class EventListField(serializers.Field):
    def to_internal_value(self, data):
        return data

    def validate(self, data):
        if not set(data).issubset(VALID_EVENT_RESOURCES):
            raise ValidationError(u'Invalid event subscription: {}'.format(
                ', '.join(set(data).difference(VALID_EVENT_RESOURCES))
            ))


class SentryAppSerializer(Serializer):
    name = serializers.CharField()
    scopes = ApiScopesField()
    events = EventListField(required=False)
    webhookUrl = serializers.URLField()
    redirectUrl = serializers.URLField(required=False)
    isAlertable = serializers.BooleanField(required=False)
    overview = serializers.CharField(required=False)

    def validate(self, attrs):
        # TODO: Validate this code against previous versions - signature change after 3.0+
        if not attrs.get('scopes'):
            return attrs

        for resource in attrs.get('events'):
            needed_scope = REQUIRED_EVENT_PERMISSIONS[resource]
            if needed_scope not in attrs['scopes']:
                raise ValidationError(
                    u'{} webhooks require the {} permission.'.format(resource, needed_scope),
                )

        return attrs
