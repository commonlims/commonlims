from __future__ import absolute_import
import pytest
import json
from rest_framework import status
from sentry.testutils import APITestCase
from django.core.urlresolvers import reverse
from clims.configuration.work_definition import WorkDefinitionBase
from clims.configuration.hooks import button
from clims.api.serializers.models.work_definition import WorkDefinitionSerializer


class TestWorkDefinition(APITestCase):
    def setUp(self):
        self.register_extensible(MyFancyStep)

    @pytest.mark.dev_edvard
    def test_get_step_template__fetched_from_name__returns_list_of_buttons(self):
        # This test case is thought of to happen when user enters a step, and
        # the UI should conform to the step configuration.
        step_full_name = 'endpoints.test_work_definition.MyFancyStep'
        url = reverse(
            'clims-api-0-work-definition-details',
            args=(self.organization.name, step_full_name)
        )
        self.login_as(self.user)
        step_name = 'My fancy step'
        response = self.client.get(url)
        assert response.status_code == 200, response.content
        assert response.data['name'] == step_name
        assert response.data['full_name'] == step_full_name
        serializer = WorkDefinitionSerializer(data=response.data)
        assert serializer.is_valid()
        assert response.data['buttons'] == \
            [{"caption": "My submit button", "event": "on_button_click1"}]

    def test_trigger_button_call__from_step_template_and_button_name(self):
        # This endpoint is called when user presses a button within a step
        url = reverse('clims-api-0-events', args=(self.organization.name,))
        specification_payload = {
            'full_name': 'endpoints.test_work_definition.MyFancyStep',
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


class MyFancyStep(WorkDefinitionBase):
    name = 'My fancy step'

    @button('My submit button')
    def on_button_click1(self, workbatch):
        setattr(MyFancyStep, 'was_called', True)
