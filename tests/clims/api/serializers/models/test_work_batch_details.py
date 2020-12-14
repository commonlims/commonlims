from __future__ import absolute_import

from sentry.testutils import TestCase

from clims.api.serializers.models.work_batch_details import WorkBatchDetailsSerializer
from clims.services.workbatch import WorkBatchBase
from clims.services.extensible import TextField


class WorkBatchDetailsSerializerTest(TestCase):
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
        assert result.get('created_at', None)
        assert result.get('updated_at', None)

    def test_can_instantiate_serializer__with_no_properties(self):
        data = {
            'properties': None,
            'id': 1,
            'name': 'Test1',
        }
        serializer = WorkBatchDetailsSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_can_update_workbatch_property__from_no_value(self):
        data = {
            'id': 1,
            'name': 'Test1',
            'properties': {
                'kit_type': {'value': 'kit type value'},
            }
        }
        workbatch = MyWorkbatchImplementation(name='my_workbatch')
        workbatch.save()
        serializer = WorkBatchDetailsSerializer(workbatch, data=data)
        assert serializer.is_valid()
        updated_workbatch = serializer.save()
        assert updated_workbatch.kit_type == 'kit type value'

    def test_can_update_workbatch_property__from_existing_value(self):
        data = {
            'id': 1,
            'name': 'Test1',
            'properties': {
                'kit_type': {'value': 'kit type value'},
            }
        }
        workbatch = MyWorkbatchImplementation(name='my_workbatch')
        workbatch.kit_type = 'previous value'
        workbatch.save()
        serializer = WorkBatchDetailsSerializer(workbatch, data=data)
        assert serializer.is_valid()
        updated_workbatch = serializer.save()
        assert updated_workbatch.kit_type == 'kit type value'

    def test_can_update_workbatch_properties__with_properties_set_to_none(self):
        data = {
            'id': 1,
            'name': 'Test1',
            'properties': None
        }
        workbatch = MyWorkbatchImplementation(name='my_workbatch')
        workbatch.save()
        serializer = WorkBatchDetailsSerializer(workbatch, data=data)
        assert serializer.is_valid()
        updated_workbatch = serializer.save()
        assert updated_workbatch.kit_type is None

    def test_can_update_workbatch_properties__with_properties_set_to_empty(self):
        data = {
            'id': 1,
            'name': 'Test1',
            'properties': {}
        }
        workbatch = MyWorkbatchImplementation(name='my_workbatch')
        workbatch.save()
        serializer = WorkBatchDetailsSerializer(workbatch, data=data)
        assert serializer.is_valid()
        updated_workbatch = serializer.save()
        assert updated_workbatch.kit_type is None

    def test_update_workbatch_properties__with_empty_dict__previous_values_dont_change(self):
        # TODO: is this the intended behavour?
        data = {
            'id': 1,
            'name': 'Test1',
            'properties': {}
        }
        workbatch = MyWorkbatchImplementation(name='my_workbatch')
        workbatch.kit_type = 'kit type value'
        workbatch.save()
        serializer = WorkBatchDetailsSerializer(workbatch, data=data)
        assert serializer.is_valid()
        updated_workbatch = serializer.save()
        assert updated_workbatch.kit_type == 'kit type value'


class MyWorkbatchImplementation(WorkBatchBase):
    kit_type = TextField(display_name="Kit type")
