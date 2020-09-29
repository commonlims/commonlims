from __future__ import absolute_import

from sentry.testutils import APITestCase
from clims.api.endpoints.work_definition_details import WorkDefinitionDetailsEndpoint


class WorkDefinitionDetailsTest(APITestCase):
    endpoint = WorkDefinitionDetailsEndpoint.name

    def setUp(self):
        self.clean_workflow_engine_state()
        self.install_main_demo_plugin()
        self.has_context()

    def test_get(self):
        raise NotImplementedError()
        from clims.plugins.demo.dnaseq.workflows.sequence import SequenceSimple
        from clims.plugins.demo.dnaseq.models import ExamplePlate, ExampleSample

        # Install with plugin API
        sample_count = 2
        cont = ExamplePlate(name="cont1")
        for x in range(1, sample_count + 1):
            sample = ExampleSample(name="sample-{}".format(x))
            cont.append(sample)
        cont.save()
        workflow = SequenceSimple()
        workflow.assign(cont)

        # Get through REST API
        self.login_as(self.user)
        response = self.client.get(self.get_url())
        expected = [{
            u"id": u"clims.plugins.demo.dnaseq.workflows.sequence.SequenceSimple/DataEntry",
            u"count": sample_count,
            u"name": u"Data entry",
            u"processDefinitionKey": u"clims.plugins.demo.dnaseq.workflows.sequence.SequenceSimple",
            u"processDefinitionName": u"SequenceSimple",
            u"workDefinitionKey": u"DataEntry",
        }]

        assert response.status_code == 200
        assert expected == response.json()
