from __future__ import absolute_import

from django.db import transaction
from clims.models.transition import Transition as TransitionModel
from clims.models.transition import TransitionType
from clims.models.location import SubstanceLocation as LocationModel
from clims.models.container import Container as ContainerModel
from clims.models.substance import Substance as SubstanceModel


class TransitionService:
    def __init__(self, app):
        self._app = app

    # TODO: CLIMS-401 - ensure atomic transaction only commits after plugin logic runs
    # Atomic transaction:
    # 1. create target location record
    # 2. set "current" on source location record to false
    # 3. create transition record
    @transaction.atomic
    def create(self, work_batch_id, transition_type, source_location_id, target_location):
        """
        Creates a new Transition
        """

        # Validate source location
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
