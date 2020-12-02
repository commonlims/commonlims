from __future__ import absolute_import

from django.db import transaction
from clims.models.transition import Transition as TransitionModel
from clims.models.transition import TransitionType
from clims.models.location import SubstanceLocation as LocationModel
from clims.models.container import Container as ContainerModel
from clims.models.substance import Substance as SubstanceModel
from clims.services.container import IndexOutOfBounds


class TransitionService:
    def __init__(self, app):
        self._app = app

    # TODO: CLIMS-401 - ensure atomic transaction only commits after plugin logic runs
    # Atomic transaction:
    # 1. create target location record
    # 2. set "current" on source location record to false
    # 3. create transition record
    @transaction.atomic
    def create(self, transitions):
        """
        Creates transitions from a list of dictionaries on the format:
        {
            source_location: {substance_id: <id>, container_id: <id>, index="a1"},
            target_location: {container_id: <id>, index="h12"},
            type: [move|spawn]
        }

        The index must be valid for the container type
        """

        container_ids = set()
        for transition in transitions:
            container_ids.add(transition["source_position"]["container_id"])
            container_ids.add(transition["target_position"]["container_id"])

        print("HEREEE", container_ids)

        # 1. Batch fetch all containers
        # TODO: This method is not implemented, but containers.get(id=someid) is
        containers = self._app.containers.batch_get(container_ids)

        # 2. Do the transitions
        for transition in transitions:
            # pseudocode:
            source = containers[transition.source_location.container_id]
            target = containers[transition.source_location.container_id]

            # check if spawn or move
            substance = substance.create_child()

            # TODO: This should be in a batch call
            target[transition.target_location.index] = substance
            target.save()

            # last thing: create a transition and save it
            transition.source_location = source.get_
            transition.save()



        raise X
        transition_type = transition["transition_type"]
        assert(TransitionType.valid(transition_type))

        # Validate source location
        source_location_id = transition["source_location_id"]
        try:
            source_location = LocationModel.objects.get(pk=int(source_location_id))
            assert source_location.current is True
        except LocationModel.DoesNotExist:
            raise AssertionError("Source location not found or is not current: '{}'".format(source_location_id))

        substance_id = source_location.substance.id
        try:
            substance = self._app.substances.get(id=substance_id)
        except SubstanceModel.DoesNotExist:
            raise AssertionError("Source substance not found: '{}'".format(substance_id))

        # If transition type is SPAWN, create a child substance
        if transition_type == TransitionType.SPAWN:
            substance = substance.create_child()

        # TODO: CLIMS-464 - validate target location
        target_location = transition["target_location"]
        container_id = target_location["container_id"]
        x = target_location["x"]
        y = target_location["y"]

        # Z is optional
        z = 0
        if "z" in target_location:
            z = target_location["z"]

        try:
            container = self._app.containers.get(id=container_id)
        except ContainerModel.DoesNotExist:
            raise AssertionError("Target location container not found: '{}'".format(container_id))

        # 1. create target location record
        # TODO: dry this up using refactored code from extensible.py
        new_location = LocationModel(
            container_id=container.id,
            substance_id=substance.id,
            x=x,
            y=y,
            z=z,
            container_version=container.version,
            substance_version=substance.version,
            current=True)
        new_location.save()

        # 2. set "current" on source location record to false
        source_location.current = False
        source_location.save()

        # 3. create transition record
        transition = TransitionModel(
            work_batch_id=work_batch_id,
            source_location=source_location,
            target_location=new_location,
            transition_type=transition_type,
        )
        transition.save()

        return transition

    """
    Validates the coordinates of a container.
    """

    def _validate_location(self, container_id, container_index):
        try:
            container = self._app.containers.get(id=container_id)
        except ContainerModel.DoesNotExist:
            raise AssertionError("Target location container not found: '{}'".format(container_id))

        try:
            ix = container.IndexType.from_any_type(self, container_index)
            container._validate_boundaries(ix)
        except IndexOutOfBounds:
            raise AssertionError("Target location index out of bounds: '{}'".format(container_index))

        return container

    """
    Validates source location.
    """

    def validate_source_location(self, container_id, container_index):
        container = self._validate_location(container_id, container_index)
        return container[container_index]  # This is always empty!

    """
    Validates target location.
    """

    def validate_target_location(self, container_id, container_index):
        return self._validate_location(container_id, container_index)
