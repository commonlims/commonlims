from __future__ import absolute_import

from sentry.testutils import TestCase
from clims.configuration.hooks import button
from clims.configuration.step import Step


class TestStepTemplate(TestCase):
    def test_retreive_button_names(self):
        assert UserDefinedStepClass.buttons() == ['button1']


class UserDefinedStepClass(Step):
    @button('button1')
    def on_change(self):
        pass
