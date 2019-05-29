
from __future__ import absolute_import

from sentry.testutils import TestCase

from clims.api.serializers.models.usertask import UserTaskSerializer
from clims.models.user_task import UserTask


class UserTaskSerializerTest(TestCase):
    def test_can_serialize_task(self):

        model = UserTask(id=1, name="Test1", organization_id=1, handler="somehandler")

        result = UserTaskSerializer(model).data
        assert result.get('created')
        assert result.get('handler') == 'somehandler'
        assert result.get('id') == 1
        assert result.get('name') == 'Test1'
        assert result.get('organization') == 1
        assert result.get('status') == 0
