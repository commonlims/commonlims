from __future__ import absolute_import
import pytest
from sentry.testutils import APITestCase
from django.core.urlresolvers import reverse
from clims.configuration.step import Step
from clims.configuration.hooks import button


class TestStepConfiguration(APITestCase):
    @pytest.mark.dev_edvard
    def test_get_step_configuration__with_name_as_input__returns_list_of_buttons(self):
        self.register_extensible(MyFancyStep)
        url = reverse('clims-api-0-steps', args=(self.organization.name,))
        self.login_as(self.user)
        step_name = 'clims.plugins.demo.dnaseq.configuration.my_fancy_step.MyFancyStep'
        response = self.client.get(url + '?name=' + step_name)
        assert response.status_code == 200, response.content
        assert len(response.data) == 1, len(response.data)
        assert response.data[0]['name'] == step_name
        # serializer = ContainerSerializer(data=response.data[0])
        # expanded_serializer = ContainerExpandedSerializer(data=response.data[0])
        # assert serializer.is_valid()
        # assert expanded_serializer.is_valid() is False


class MyFancyStep(Step):
    name = 'My fancy step'

    @button('My submit button')
    def on_button_click1(self):
        pass
