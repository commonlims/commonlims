"""
Integration tests for the built-in dna seq plugin:
    * Ensure that the plugin registers correctly, mocking out only the workflow engine
"""
from __future__ import absolute_import

import pytest
from clims.models import SubstanceAssignment
from sentry.testutils import TestCase
from clims.models import Workflow
from clims.plugins.demo.dnaseq import DemoDnaSeqPlugin
from clims.plugins.demo.dnaseq.models import ExamplePlate, ExampleSample
from clims.plugins.demo.dnaseq.workflows.sequence import SequenceSimple


class TestDemoDnaSeqPlugin(TestCase):
    """
    Makes sure that the dnaseq demo plugin is installed in the DB as well as in Camunda.

    Requires test_camunda to be running (middleware/local/stack.yml)
    """

    def setUp(self):
        """
        Installs the demo plugin in a clean environment.
        """
        self.clean_workflow_engine_state()
        self.app.plugins.install_plugins(DemoDnaSeqPlugin)
        self.has_context()

    def test_install_plugin_works(self):
        assert Workflow.objects.count() == 2

    def test_can_assign_substances(self):
        """
        Tests an entire path in the workflow: assigning samples, starting a workbatch and
        closing the workbatch
        """
        # Create a handler so we model the highest level of interacting with the API, the same
        # way plugin developers would interact with it:

        sample_count = 5
        self.toggle_log_level()

        cont = ExamplePlate(name="cont1")
        for x in range(1, sample_count + 1):
            sample = ExampleSample(name="sample-{}".format(x))
            cont.append(sample)
        cont.save()

        workflow = SequenceSimple()
        workflow.comment = "Let's sequence some stuff"
        workflow.assign(cont)

        # We should see one assignment per sample
        samples_created = set([x.id for x in cont.contents])
        delivered = SubstanceAssignment.objects.filter(status=SubstanceAssignment.STATUS_DELIVERED)
        assigned_samples = set([x.substance.id for x in delivered])
        assert samples_created == assigned_samples

        work_units = workflow.wait_for_work_units("DataEntry", 5)
        tracked_objects_in_workflow_engine = [w.tracked_object.id for w in work_units]
        assert len(tracked_objects_in_workflow_engine) == sample_count

    @pytest.mark.xfail
    def test_install_plugin_again_is_ok(self):
        """
        Installing the same plugin twice should have no effect on the registered plugins
        """
        raise NotImplementedError()
