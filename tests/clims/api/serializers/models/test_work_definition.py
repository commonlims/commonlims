from __future__ import absolute_import

from sentry.testutils import TestCase

from clims.api.serializers.models.work_definition import WorkDefinitionSerializer


class WorkDefinitionSerializerTest(TestCase):
    def test_can_serialize_work_definition(self):
        from clims.services.workflow import WorkDefinitionInfo

        definition_info = WorkDefinitionInfo(
            id='123',
            name='name',
            process_definition_key='process_def',
            work_definition_key='workunit',
            process_definition_name='procdefname',
            count=10)

        data = WorkDefinitionSerializer(definition_info).data
        assert data == {
            'count': definition_info.count,
            'name': definition_info.name,
            'processDefinitionKey': definition_info.process_definition_key,
            'processDefinitionName': definition_info.process_definition_name,
            'workDefinitionKey': definition_info.work_definition_key,
            'id': definition_info.id,
        }
