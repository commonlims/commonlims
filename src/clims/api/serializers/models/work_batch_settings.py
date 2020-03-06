

from sentry.api.serializers import Serializer, register, serialize
from clims.models.workbatchsettings import SubtaskSettings, WorkBatchSettings, WorkBatchAction, WorkBatchField


@register(WorkBatchSettings)
class WorkBatchSettingsSerializer(Serializer):
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


@register(WorkBatchAction)
class WorkBatchActionSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        return {
            "title": obj.title,
            "description": obj.description
        }


@register(WorkBatchField)
class WorkBatchFieldSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        return {
            "title": obj.title,
            "description": obj.description
        }
