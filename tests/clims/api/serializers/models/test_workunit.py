from __future__ import absolute_import

from sentry.testutils import TestCase

from clims.api.serializers.models.workunit import WorkUnitSerializer
from clims.models.workunit import WorkUnit
from clims.plugins.demo.dnaseq.models import ExampleSample


class WorkUnitSerializerTest(TestCase):
    def setUp(self):
        self.install_main_demo_plugin()
        self.has_context()

    def test_can_serialize_work_unit(self):
        """
        A regular WorkUnit has an ID and an entry in the database.
        """
        sample = ExampleSample(name="S1")
        sample.save()
        work_unit = WorkUnit()
        work_unit.tracked_object = sample
        work_unit.save()
        result = WorkUnitSerializer(work_unit).data

        assert result == {
            "id": work_unit.id,
            "tracked_object_global_id": sample.global_id,
            "external_work_unit_id": None,
            "external_workflow_instance_id": None,
        }

    def test_can_serialize_external_work_unit(self):
        """
        WorkUnits can be external only. In this case they only exist in the external
        workflow engine, as the system hasn't picked them up yet.
        """
        sample = ExampleSample(name="S1")
        sample.save()
        work_unit = WorkUnit(external_work_unit_id="abc", external_workflow_instance_id="123")
        work_unit.tracked_object = sample
        result = WorkUnitSerializer(work_unit).data

        assert result == {
            "id": None,
            "tracked_object_global_id": sample.global_id,
            "external_work_unit_id": work_unit.external_work_unit_id,
            "external_workflow_instance_id": work_unit.external_workflow_instance_id,
        }
