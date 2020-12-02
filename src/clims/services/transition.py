from __future__ import absolute_import

from django.db import transaction
from clims.models.transition import Transition as TransitionModel
from clims.models.transition import TransitionType
from clims.services.container import IndexOutOfBounds, PlateIndex


class TransitionService:
    def __init__(self, app):
        self._app = app

    def parse_position(self, transition, containers, prefix):
        position = transition['{}_position'.format(prefix)]
        container_id = position["container_id"]
        container = next((c for c in containers if c.id == container_id), None)
        index = position["index"]
        # This will throw an IndexOutOfBounds if the position is invalid
        substance = container[index]
        return ({
            "container": container,
            "index": index,
            "substance": substance
        })

    def batch_create(self, work_batch_id, transitions):
        container_ids = set()
        for transition in transitions:
            container_ids.add(transition["source_position"]["container_id"])
            container_ids.add(transition["target_position"]["container_id"])

        containers = self._app.containers.batch_get(container_ids)
        transition_ids = []

        for transition in transitions:
            tid = self.create(transition, containers, work_batch_id)
            transition_ids.append(tid)

        return transition_ids

    # TODO: CLIMS-401 - ensure atomic transaction only commits after plugin logic runs
    @transaction.atomic
    def create(self, transition, containers, work_batch_id):
        """
        Creates a new Transition
        """
        try:
            source = self.parse_position(transition, containers, 'source')
        except IndexOutOfBounds:
            raise AssertionError("Source position invalid: '{}'".format(transition))

        try:
            target = self.parse_position(transition, containers, 'target')
        except IndexOutOfBounds:
            raise AssertionError("Target position invalid: '{}'".format(transition))

        source_substance = source["substance"]
        if source_substance is None:
            raise AssertionError("Source substance not found: '{}'".format(source))

        source_location = source_substance.raw_location()

        transition_type = TransitionType.from_str(transition["type"])
        if not TransitionType.valid(transition_type):
            raise AssertionError("Invalid transition type: '{}'".format(transition["type"]))

        # If transition type is SPAWN, create a child substance
        substance = source_substance
        if transition_type == TransitionType.SPAWN:
            substance = source_substance.create_child()

        # Move substance regardless of whether this is a "spawn" or "move"
        target_loc = PlateIndex.from_string(target["container"], target["index"])
        substance.move(target["container"], (target_loc.x, target_loc.y, target_loc.z))
        substance.save()
        target_location = substance.raw_location()

        # 3. create transition record
        transition = TransitionModel(
            work_batch_id=work_batch_id,
            source_location=source_location,
            target_location=target_location,
            transition_type=transition_type,
        )
        transition.save()
        return transition.id
