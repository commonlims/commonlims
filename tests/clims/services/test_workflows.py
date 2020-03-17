from __future__ import absolute_import

import pytest
from sentry.testutils import TestCase
from clims.plugins.demo.dnaseq.models import ExampleSample
from clims.plugins.demo.dnaseq.workflows.sequence import SequenceSimple


class TestWorkflowService(TestCase):
    def setUp(self):
        self.install_main_demo_plugin()
        self.has_context()

    def test_can_not_assign_non_existing_substances(self):
        with pytest.raises(self.app.workflows.AssignmentError):
            workflow = SequenceSimple()
            sample = ExampleSample()
            workflow.assign(sample)

    def test_creates_assignment_entries(self):
        workflow = SequenceSimple()
        sample = ExampleSample(name="SomeSample")
        sample.save()
        workflow.assign(sample)
