from __future__ import absolute_import

from sentry.testutils import TestCase

from clims.api.serializers.models.work_batch import WorkBatchSerializer
from clims.services.workbatch import WorkBatchBase


class WorkBatchSerializerTest(TestCase):
    def setUp(self):
        self.has_context()
        self.register_extensible(MyWorkbatchImplementation)

    def test_can_serialize_workbatch(self):
        workbatch = MyWorkbatchImplementation(name="Test1")
        result = WorkBatchSerializer(workbatch).data
        assert result.get('id') == workbatch.id
        assert result.get('name') == 'Test1'
        assert result.get('cls_full_name') == 'serializers.models.test_work_batch.MyWorkbatchImplementation'


class MyWorkbatchImplementation(WorkBatchBase):
    pass
