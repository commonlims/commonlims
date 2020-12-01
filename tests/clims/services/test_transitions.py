
from __future__ import absolute_import
from sentry.testutils import TestCase
from clims.services.transition import TransitionService
from clims.services.workbatch import WorkBatchBase
from clims.services.substance import SubstanceBase
import pytest
from clims.services.container import ContainerBase
from clims.models.transition import TransitionType
from clims.models.location import SubstanceLocation as LocationModel
import random


class TestTransitionService(TestCase):

    def setUp(self):
        self.has_context()
        self.ts = TransitionService(self.app)

        # Create workbatch
        self.register_extensible(MyWorkbatchImplementation)
        self.work_batch = MyWorkbatchImplementation(name='test-transitions-workbatch')
        self.work_batch.save()

        # Create container
        self.register_extensible(MyContainerImplementation)
        self.container = MyContainerImplementation(name='test-transitions-container')
        self.container.save()

        # Create samples
        self.register_extensible(MySampleImplementation)
        self.samples = []
        for _ix in range(5):
            name = "test-transitions-sample-{}".format(random.randint(1, 10000000))
            sample = MySampleImplementation(name=name)
            sample.save()
            location = LocationModel(
                container_id=self.container.id,
                substance_id=sample.id,
                x=_ix,
                y=_ix,
                z=0,
                container_version=self.container.version,
                substance_version=sample.version,
                current=True)
            location.save()
            self.samples.append(sample)

    @classmethod
    def create_container(cls):
        name = "test-transitions-container-{}".format(random.randint(1, 10000000))
        container = MyContainerImplementation(name=name)
        container.save()
        return container

    @classmethod
    def create_sample_at_location(cls, container, x, y):
        name = "test-transitions-sample-{}".format(random.randint(1, 10000000))
        sample = MySampleImplementation(name=name)
        sample.save()
        location = LocationModel(
            container_id=container.id,
            substance_id=sample.id,
            x=x,
            y=y,
            z=0,
            container_version=container.version,
            substance_version=sample.version,
            current=True)
        location.save()
        return location

    @classmethod
    def create_transition_request(cls):
        ctr = TestTransitionService.create_container()
        loc = TestTransitionService.create_sample_at_location(ctr, 0, 0)
        transition = {
            "source_location_id": loc.id,
            "target_location": {
                "container_id": ctr.id,
                "x": 1,
                "y": 2,
            },
            "transition_type": TransitionType.MOVE
        }
        return transition, ctr, loc

    @pytest.mark.steinar
    def test_my_stuff(self):
        # 1. Create a substance in some container
        # 2. Create another container
        # 3. Call the transition service to move to it
        pass
        self.install_main_demo_plugin()

        # from clims.plugins.demo.dnaseq.models import PandorasBox
        # print(PandorasBox)

    def test__create_move_transition(self):
        transition, ctr, loc = TestTransitionService.create_transition_request()
        transition = self.ts.create(transition, self.work_batch.id)
        assert transition.id

        # Check that the substance now has the new location
        substance = transition.source_location.substance
        substance = self.app.substances.get(id=substance.id)
        new_loc = substance.location
        assert new_loc.x == 1
        assert new_loc.y == 2

    def test__create_spawn_transition(self):
        transition, ctr, loc = TestTransitionService.create_transition_request()
        transition["transition_type"] = TransitionType.SPAWN
        transition = self.ts.create(transition, self.work_batch.id)
        assert transition.id

        # Check that the transitioned substance now has a child
        substance = transition.target_location.substance
        target_substance = self.app.substances.get(id=substance.id)
        source_location_substance_id = loc.substance.id
        target_substance_parent = target_substance._archetype.parents.first()
        target_substance_parent_id = target_substance_parent.archetype_id
        assert source_location_substance_id == target_substance_parent_id

    def test__create_transition_invalid_source_location(self):
        transition, ctr, loc = TestTransitionService.create_transition_request()
        transition["source_location_id"] = -5
        with self.assertRaises(Exception):
            self.ts.create(transition, self.work_batch.id)

    def test__create_transition_invalid_container_id(self):
        transition, ctr, loc = TestTransitionService.create_transition_request()
        transition["target_location"]["container_id"] = -5
        with self.assertRaises(Exception):
            self.ts.create(transition, self.work_batch.id)

    def test__create_transition_invalid_type(self):
        transition, ctr, loc = TestTransitionService.create_transition_request()
        transition["transition_type"] = -5
        with self.assertRaises(Exception):
            self.ts.create(transition, self.work_batch.id)


class MyWorkbatchImplementation(WorkBatchBase):
    pass


class MyContainerImplementation(ContainerBase):
    rows = 10
    columns = 10


class MySampleImplementation(SubstanceBase):
    pass
