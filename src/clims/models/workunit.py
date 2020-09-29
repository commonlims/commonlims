from __future__ import absolute_import

from django.db import models
from sentry.db.models import (FlexibleForeignKey, sane_repr)
from clims.models.substance import Substance
from clims.models.container import Container


class WorkUnit(models.Model):
    """
    Represents a single item that needs to be processed manually. A WorkBatch consists of 1..n
    WorkUnits.

    WorkUnits can either point to an external workflow engine (such as Camunda, where they map
    to UserTasks) or not. If they point to no workflow engine, resolving the WorkUnit will just
    close that item without further tracking. This makes it possible to use the same views to
    work on items that are within a workflow or not.
    """
    __core__ = False

    # The link to an external workflow engine which can be used to push the item further
    # if work in Common LIMS has finished
    external_work_unit_id = models.TextField(null=True, unique=True)

    external_workflow_instance_id = models.TextField(null=True)

    # The ID of the external workflow provider, e.g. Camunda. If the item is being worked on
    # without a workflow engine, this is None
    workflow_provider = models.TextField(null=True)

    work_batch = FlexibleForeignKey('clims.WorkBatch', null=True, related_name="work_units")

    # A WorkUnit either connects to a single Substance or a Container, never both.
    substance = FlexibleForeignKey('clims.Substance', null=True)

    container = FlexibleForeignKey('clims.Container', null=True)

    # The WorkType is the full namespace of the Python class that defines what happens in the
    # workflow
    work_type = models.TextField(null=True)

    @property
    def tracked_object_global_id(self):
        return self.tracked_object.global_id

    @property
    def tracked_object(self):
        if self.substance is not None:
            return self.substance
        elif self.container is not None:
            return self.container
        else:
            return None

    @tracked_object.setter
    def tracked_object(self, value):
        value = value._archetype
        if isinstance(value, Substance):
            self.substance = value
        elif isinstance(value, Container):
            self.container = value
        else:
            raise AssertionError("Unexpected tracked_object type {}".format(type(value)))

    class Meta:
        app_label = 'clims'
        db_table = 'clims_workunit'

    __repr__ = sane_repr('workflow_provider',
            'external_work_unit_id', 'external_workflow_instance_id')
