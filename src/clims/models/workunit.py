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

    # The ID of the external workflow provider, e.g. camunda. If the item is being worked on
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
        """
        Returns the extensible (Substance or Container) that's being tracked in this WorkUnit.
        """
        return getattr(self, '_tracked_object', None)

    @tracked_object.setter
    def tracked_object(self, value):
        """
        Sets the extensible that's being tracked in this WorkUnit.
        """
        model = value._archetype
        if isinstance(model, Substance):
            self.substance = model
        elif isinstance(model, Container):
            self.container = model
        else:
            raise AssertionError("Unexpected tracked_object model type {}".format(type(model)))
        self._tracked_object = value

    @property
    def external_work_unit_key(self):
        """
        Returns both the workflow_provider and the external_work_unit_id as one tuple (key).
        This is required for fully identifying a work unit between different workflow providers.
        """
        return (self.workflow_provider, self.external_work_unit_id)

    @staticmethod
    def by_external_ids(work_units):
        """
        Batch fetches all WorkUnits based on the external id. Requires the workflow provider
        and the external_work_unit_id to be set on all entries.
        """
        sql_args = list()  # The arguments we'll add in the sql text, must be %s to avoid sql inj.
        sql_params = list()

        for cur in work_units:
            # Note that the following is not an error although it may be non-intuitive. We need
            # to list all the params to the sql statement in order and they should not be touples.
            sql_params.append(cur.workflow_provider)
            sql_params.append(cur.external_work_unit_id)
            sql_args.append("(%s, %s)")

        # It might be that django supports in searches on composite keys, but I haven't seen it
        sql_args_comma_sep = ",".join(sql_args)
        sql = ("SELECT * "
               "FROM clims_workunit "
               "WHERE "
               "(workflow_provider, external_work_unit_id) IN ( " + sql_args_comma_sep + " )")
        work_units = WorkUnit.objects.raw(sql, sql_params)
        return work_units

    class Meta:
        app_label = 'clims'
        db_table = 'clims_workunit'

    __repr__ = sane_repr('workflow_provider',
            'external_work_unit_id', 'external_workflow_instance_id')


class ExternalWorkUnit(object):
    """
    Represents a WorkUnit that's in an external workflow engine but does not necessarily yet
    have a corresponding entry in the datastore.
    """

    def __init__(self, work_unit, tracked_object_global_id):
        self.work_unit = work_unit
        self.tracked_object_global_id = tracked_object_global_id

    @property
    def tracked_object_class(self):
        category, _ = self.tracked_object_global_id.split("-")
        return category

    @property
    def tracked_object_local_id(self):
        _, id = self.tracked_object_global_id.split("-")
        return id
