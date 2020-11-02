from __future__ import absolute_import
import pytest
from sentry.testutils import APITestCase
from django.core.urlresolvers import reverse
from clims.configuration.work_definition import WorkBatchDefinitionBase
from clims.configuration.hooks import button
from clims.api.serializers.models.work_batch_details_definition import WorkBatchDetailsDefinitionSerializer


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
        serializer = WorkBatchDetailsDefinitionSerializer(data=response.data)
        assert serializer.is_valid()
        assert response.data['buttons'] == \
            [{"caption": "My submit button", "event": "on_button_click1"}]


class MyFancyStep(WorkBatchDefinitionBase):
    name = 'My fancy step'

    @button('My submit button')
    def on_button_click1(self, workbatch):
        pass
