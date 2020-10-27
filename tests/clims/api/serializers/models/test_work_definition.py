from __future__ import absolute_import

from sentry.testutils import TestCase

from clims.api.serializers.models.work_definition import WorkDefinitionSerializer
from clims.configuration.work_definition import WorkDefinitionBase
from clims.configuration.hooks import button


class WorkDefintionSerializerTest(TestCase):
    def setUp(self):
        self.has_context()
        self.register_extensible(MyFancyStep)

    def test_can_serialize_work_definition(self):
        work_definition = MyFancyStep()
        result = WorkDefinitionSerializer(work_definition).data
        assert result.get('id') == 'serializers.models.test_work_definition.MyFancyStep'
        assert result.get('full_name') == 'serializers.models.test_work_definition.MyFancyStep'
        assert result.get('name') == 'My fancy step'
        assert result.get('buttons') == [{'caption': 'My submit button', 'event': 'on_button_click1'}]


class MyFancyStep(WorkDefinitionBase):
    name = 'My fancy step'

    @button('My submit button')
    def on_button_click1(self, workbatch):
        setattr(MyFancyStep, 'was_called', True)
