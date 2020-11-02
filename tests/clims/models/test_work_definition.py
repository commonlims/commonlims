from __future__ import absolute_import
import pytest
from sentry.testutils import TestCase
from clims.configuration.work_batch_definition import WorkBatchDefinitionBase, Button
from clims.configuration.hooks import button
from clims.services.extensible import FloatField


class TestWorkDefinition(TestCase):
    def setUp(self):
        self.register_extensible(MyFancyWork)
        self.has_context()

    def test_can_set_extensible_field_on_step(self):
        work_definition = MyFancyWork()
        work_definition.concentration = 11

        assert work_definition.concentration == 11

    @pytest.mark.dev_edvard
    def test_get_buttons(self):
        work_definition = MyFancyWork()
        buttons = work_definition.buttons()
        assert len(buttons) == 1
        assert buttons[0] == Button(name='on_button_click1', caption='My submit button')


class MyFancyWork(WorkBatchDefinitionBase):
    name = 'My fancy step'
    concentration = FloatField(display_name='Concentration (ng/ul)')

    @button('My submit button')
    def on_button_click1(self, workbatch):
        pass
