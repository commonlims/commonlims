

from sentry.testutils import TestCase

from clims.api.serializers.models.validation_issue import ValidationIssueSerializer
from clims.models.validation_issue import ValidationIssue


class ValidationIssueSerializerTest(TestCase):
    def test_can_serialize_issue_with_type_only(self):
        model = ValidationIssue('error')
        serialized = ValidationIssueSerializer(model).data

        assert serialized == {
            'type': u'error',
            'column': None,
            'object_id': None,
            'file': None,
            'msg': None,
            'row': None
        }

    def test_can_serialize_all_info(self):
        model = ValidationIssue('error', msg='message', row='row',
                column='col', object_id='obj', file='file')
        serialized = ValidationIssueSerializer(model).data

        assert serialized == {
            'column': u'col',
            'object_id': u'obj', 'file': u'file', 'msg': u'message', 'type': u'error', 'row': u'row'}
