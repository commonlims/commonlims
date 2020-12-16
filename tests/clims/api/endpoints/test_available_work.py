from __future__ import absolute_import

import pytest

from django.core.urlresolvers import reverse

from sentry.testutils import APITestCase

from clims.plugins.demo.dnaseq import DemoDnaSeqPlugin
from clims.plugins.demo.dnaseq.models import ExamplePlate, ExampleSample
from clims.plugins.demo.dnaseq.workflows.sequence import SequenceSimple
from clims.api.endpoints.available_work import AvailableWorkEndpoint


class AvailableWorkEndpointTest(APITestCase):
    def setUp(self):
        """
        Installs the demo plugin in a clean environment.
        """
        self.clean_workflow_engine_state()
        self.app.plugins.install_plugins(DemoDnaSeqPlugin)
        self.has_context()

    @staticmethod
    def create_available_work(count):
        # Makes sure we have some work that's available, i.e. start workflow and then
        # wait until the workflow is waiting for user intervention

        cont = ExamplePlate(name="cont1")
        for x in range(1, count + 1):
            sample = ExampleSample(name="sample-{}".format(x))
            cont.append(sample)
        cont.save()

        workflow = SequenceSimple()
        workflow.comment = "Let's sequence some stuff"
        workflow.assign(cont)

    @pytest.mark.uc_2_3_1
    def test_get(self):
        count = 3
        self.create_available_work(count)

        self.login_as(self.user)

        url = reverse(AvailableWorkEndpoint.name, args=(self.organization.name, ))
        response = self.wait_for_endpoint_list(url, 1)

        assert response.status_code == 200
        assert response.json() == [{
            u'id': u'clims.plugins.demo.dnaseq.workflows.sequence.SequenceSimple:DataEntry',
            u'count': count,
            u'name': u'Data entry',
            u'processDefinitionKey': u'clims.plugins.demo.dnaseq.workflows.sequence.SequenceSimple',
            u'processDefinitionName': u'SequenceSimple',
            u'workDefinitionKey': u'DataEntry',
        }]
