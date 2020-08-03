from __future__ import absolute_import
import pytest
from sentry.testutils import APITestCase
from django.core.urlresolvers import reverse
from clims.configuration.step import Step
from clims.configuration.hooks import button
from clims.api.serializers.models.step import StepSerializer


class TestStepConfiguration(APITestCase):
    @pytest.mark.dev_edvard
    def test_get_step_template__fetched_from_name__returns_list_of_buttons(self):
        # This test case is thought of to happen when user enters a step, and
        # the UI should conform to the step configuration.
        self.app.workbatches.register_step_template(MyFancyStep)
        url = reverse('clims-api-0-steps', args=(self.organization.name,))
        self.login_as(self.user)
        step_name = 'My fancy step'
        response = self.client.get(url + '?name=' + step_name)
        assert response.status_code == 200, response.content
        assert len(response.data) == 1, len(response.data)
        assert response.data[0]['name'] == step_name
        serializer = StepSerializer(data=response.data[0])
        assert serializer.is_valid()
        assert response.data[0]['buttons'] == ['My submit button']


class MyFancyStep(Step):
    name = 'My fancy step'

    @button('My submit button')
    def on_button_click1(self):
        pass
