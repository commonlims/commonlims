from __future__ import absolute_import

from sentry.testutils import TestCase

from clims.api.serializers.models.work_batch_details import WorkBatchDetailsSerializer
from clims.services.workbatch import WorkBatchBase
from clims.services.extensible import TextField


class WorkBatchSerializerTest(TestCase):
    def setUp(self):
        self.has_context()
        self.register_extensible(MyWorkbatchImplementation)

    def test_can_serialize_workbatch_details(self):
        workbatch = MyWorkbatchImplementation(name="Test1")
        workbatch.kit_type = 'kit type value'
        workbatch.save()
        result = WorkBatchDetailsSerializer(workbatch).data
        assert result.get('id') == workbatch.id
        assert result.get('name') == 'Test1'
        properties = result.get('properties')
        assert properties['kit_type']['value'] == 'kit type value'


class MyWorkbatchImplementation(WorkBatchBase):
    kit_type = TextField(display_name="Kit type")
