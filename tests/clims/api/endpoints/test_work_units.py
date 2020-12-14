from __future__ import absolute_import

import pytest
from django.core.urlresolvers import reverse

from sentry.testutils import APITestCase

from clims.plugins.demo.dnaseq import DemoDnaSeqPlugin
from clims.plugins.demo.dnaseq.models import ExamplePlate, ExampleSample
from clims.plugins.demo.dnaseq.workflows.sequence import SequenceSimple
from clims.api.endpoints.work_units import WorkUnitsByWorkDefinitionEndpoint


class WorkUnitsByWorkDefinitionEndpointTest(APITestCase):
    def setUp(self):
        self.clean_workflow_engine_state()
        self.app.plugins.install_plugins(DemoDnaSeqPlugin)
        self.has_context()

    @pytest.mark.uc_2_3_2
    def test_get(self):
        # 1. Create some work:
        count = 3
        cont = ExamplePlate(name="cont1")
        for x in range(1, count + 1):
            sample = ExampleSample(name="sample-{}".format(x))
            cont.append(sample)
        cont.save()
        created_samples_ids = {s.id for s in cont.contents}

        workflow = SequenceSimple()
        workflow.comment = "Let's sequence some stuff"
        workflow.assign(cont)

        # 2. Wait for the work to be ready:
        self.login_as(self.user)
        work_def_id = "clims.plugins.demo.dnaseq.workflows.sequence.SequenceSimple:DataEntry"
        url = reverse(WorkUnitsByWorkDefinitionEndpoint.name, args=(work_def_id, ))
        response = self.wait_for_endpoint_list(url, 3)
        assert response.status_code == 200
        data = response.json()

        assert len(data) == count
        for entry in data:
            assert len(entry) == 6

            assert entry["workflow_provider"] == "camunda"
            assert len(entry["external_work_unit_id"]) == 36  # expecting guid string
            assert entry["work_type"] == "clims.plugins.demo.dnaseq.workflows.sequence.DataEntry"
            assert entry["external_workflow_instance_id"]

            tracked_object_id = entry["tracked_object"]["id"]
            created_samples_ids.remove(int(tracked_object_id))

        # Make sure we can do a second successful query. This is because getting fresh work units
        # for the first time will save them locally, so the state has changed in the meantime
        response = self.wait_for_endpoint_list(url, 3)
        assert response.status_code == 200
