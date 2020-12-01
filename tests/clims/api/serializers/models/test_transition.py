from __future__ import absolute_import

import pytest
from sentry.testutils import TestCase

from clims.api.serializers.models.transition import TransitionSerializer
from clims.plugins.demo.dnaseq.models import ExampleSample, PandorasBox


class TransitionSerializerTest(TestCase):
    @pytest.mark.testmenot
    def test_can_serialize_transition(self):
        # TODO:
        # First let's create a transition using the high-level API.
        # We want to create an analyte from some sample:
        self.has_context()
        self.install_main_demo_plugin()

        sample1 = ExampleSample(name="sample1")
        sample1.save()
        container1 = PandorasBox(name="container1")
        container1["a1"] = sample1
        container1.save()

        container2 = PandorasBox(name="container2")
        container2.save()

        # Create an aliquot and move it in one go:
        sample1.create_child()

        user = self.create_user()

        from clims.models.transition import Transition
        transition = Transition()
        transition.user = user
        # serializer = TransitionSerializer()

        # workbatch = MyWorkbatchImplementation(name="Test1")
        # result = WorkBatchSerializer(workbatch).data
        # assert result.get('id') == workbatch.id
        # assert result.get('name') == 'Test1'
        # assert result.get('cls_full_name') == 'serializers.models.test_work_batch.MyWorkbatchImplementation'

    def test_can_serialize_transition_list(self):
        pass
