from __future__ import absolute_import

from sentry.api.serializers import Serializer, register, serialize
from sentry.models.usertasksettings import SubtaskSettings, UserTaskSettings, UserTaskAction, UserTaskField


@register(UserTaskSettings)
class UserTaskSettingsSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        return {
            "handles": obj.handles,
            "id": obj.builder_name,
            "subtasks": [serialize(subtask) for subtask in obj.subtasks]
        }


@register(SubtaskSettings)
class SubtaskSettingsSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        return {
            "viewType": obj.view_type,
            "title": obj.title,
            "actions": [serialize(action) for action in obj.actions],
            "fields": [serialize(field) for field in obj.fields],
        }


@register(UserTaskAction)
class UserTaskActionSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        return {
            "title": obj.title,
            "description": obj.description
        }


@register(UserTaskField)
class UserTaskFieldSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        return {
            "title": obj.title,
            "description": obj.description
        }
