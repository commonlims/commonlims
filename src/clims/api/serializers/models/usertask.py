
from __future__ import absolute_import


from sentry.api.serializers import Serializer, register

from clims.models.user_task import UserTask


@register(UserTask)
class UserTaskSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        # TODO
        return {}
