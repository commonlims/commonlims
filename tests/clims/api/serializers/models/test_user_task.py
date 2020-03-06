

from sentry.testutils import TestCase

from clims.api.serializers.models.workbatch import WorkBatchSerializer
from clims.models.work_batch import WorkBatch


class WorkBatchSerializerTest(TestCase):
    def test_can_serialize_task(self):

        model = WorkBatch(id=1, name="Test1", organization_id=1, handler="somehandler")

        result = WorkBatchSerializer(model).data
        assert result.get('created')
        assert result.get('handler') == 'somehandler'
        assert result.get('id') == 1
        assert result.get('name') == 'Test1'
        assert result.get('organization') == 1
        assert result.get('status') == 0
