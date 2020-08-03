from __future__ import absolute_import
import pytest
import json
from rest_framework import status
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

    def test_trigger_button_call__from_step_template_and_button_name(self):
        # This endpoint is called when user presses a button within a step
        self.app.workbatches.register_step_template(MyFancyStep)
        url = reverse('clims-api-0-script-trigger', args=(self.organization.name,))
        specification_payload = {
            'name': 'My fancy step',
            'event_type': 'button',
            'event_tag': 'My submit button',
        }
        self.login_as(self.user)
        response = self.client.post(
            path=url,
            data=json.dumps(specification_payload),
            content_type='application/json',
        )
        assert response.status_code == status.HTTP_201_CREATED, response.data
        assert getattr(MyFancyStep, 'was_called') is True


class MyFancyStep(Step):
    name = 'My fancy step'

    @button('My submit button')
    def on_button_click1(self, workbatch):
        setattr(MyFancyStep, 'was_called', True)
