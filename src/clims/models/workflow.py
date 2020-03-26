from __future__ import absolute_import

from django.db import models
from sentry.db.models import (FlexibleForeignKey, sane_repr)


class Workflow(models.Model):
    """
    Represents a Workflow in an external workflow engine.

    The details of the workflow, including which subworkflows it may have, are defined in the
    external system. The entry in the database is used to connect internal logs to the external
    workflow, e.g. Assignments.
    """
    __core__ = True

    BACKEND_CAMUNDA = 'camunda'

    # The definition of the workflow in the external system
    external_id = models.TextField()

    # The full name of the class that defines the workflow, e.g. lab_awesome.plugin.workflows.a
    name = models.TextField()

    # The version of the workflow, incrementing integer
    version = models.IntegerField()

    # True if this is the latest version of this workflow definition (with this definition_key)
    latest = models.BooleanField()

    # The backend type used
    backend = models.TextField()

    # The plugin (down to the version) that registered the workflow
    plugin_registration = FlexibleForeignKey('clims.PluginRegistration')

    # organization = FlexibleForeignKey('sentry.Organization', related_name='workflows')

    class Meta:
        app_label = 'clims'
        db_table = 'clims_workflow'

    __repr__ = sane_repr('name', 'version', 'latest', 'backend', 'external_id')
