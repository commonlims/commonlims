from __future__ import absolute_import
import json

from django.core.urlresolvers import reverse

from sentry.testutils import APITestCase

from clims.plugins.demo.dnaseq import DemoDnaSeqPlugin
from clims.plugins.demo.dnaseq.models import ExamplePlate, ExampleSample
from clims.plugins.demo.dnaseq.workflows.sequence import SequenceSimple
from clims.services.workbatch import WorkBatchBase
from clims.api.endpoints.work_batch import WorkBatchEndpoint
from clims.api.endpoints.work_units import WorkUnitsEndpoint


class WorkBatchEndpointTest(APITestCase):
    def setUp(self):
        """
        Installs the demo plugin in a clean environment.
        """
        self.clean_workflow_engine_state()
        self.app.plugins.install_plugins(DemoDnaSeqPlugin)
        self.register_extensible(MyWorkbatchImplementation)
        self.has_context()

    def test_find_single_by_name(self):
        # Arrange
        workbatch = MyWorkbatchImplementation(name='my_workbatch')
        workbatch.save()

        another_workbatch = MyWorkbatchImplementation(name='another workbatch')
        another_workbatch.save()

        search = 'workbatch.name:my_workbatch'

        url = reverse('clims-api-0-work-batches', args=(self.organization.name,))
        self.login_as(self.user)

        # Act
        response = self.client.get(url + '?search=' + search)

        # Assert
        assert response.status_code == 200, response.content
        # The search is for a unique name, so this must be true:
        assert len(response.data) == 1, len(response.data)
        assert response.data[0]['id'] == workbatch.id
        assert response.data[0]['name'] == 'my_workbatch'

    def test_post(self):
        # TODO: Fix this test, or an equivalent one.
        self.login_as(self.user)

        sample_count = 3

        cont = ExamplePlate(name="cont1")
        for x in range(1, sample_count + 1):
            sample = ExampleSample(name="sample-{}".format(x))
            cont.append(sample)
        cont.save()

        workflow = SequenceSimple()
        workflow.comment = "Let's sequence some stuff"
        workflow.assign(cont)

        # Wait until the work unit enpoint returns these items:
        work_units_url = reverse(WorkUnitsEndpoint.name, args=(self.organization.name, ))

        # Wait for getting a large enough response from the endpoint
        resp = self.wait_for_endpoint_list(work_units_url, sample_count)
        data = resp.json()
        ids = [entry["id"] for entry in data]
        data = {
            "work_units": ids,
        }

        work_batch_url = reverse(WorkBatchEndpoint.name, args=(self.organization.name, ))
        response = self.client.post(
            path=work_batch_url,
            data=json.dumps(data),
            content_type='application/json',
        )
        assert response.status_code == 201


class MyWorkbatchImplementation(WorkBatchBase):
    pass
