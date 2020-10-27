from __future__ import absolute_import, print_function

from django.db import models
from sentry.db.models import (FlexibleForeignKey, sane_repr)
from clims.models.extensible import ExtensibleModel, ExtensibleVersion


class WorkDefinition(ExtensibleModel):
    __core__ = True

    def __init__(self, *args, **kwargs):
        super(WorkDefinition, self).__init__(*args, **kwargs)

    name = models.TextField()

    organization = FlexibleForeignKey('sentry.Organization',
                                      related_name='workdefinitions')

    __repr__ = sane_repr('name', )

    class Meta:
        app_label = 'clims'
        db_table = 'clims_workdefinition'
        unique_together = ('name', 'organization')


class WorkDefinitionVersion(ExtensibleVersion):
    __core__ = True

    archetype = models.ForeignKey("clims.WorkDefinition", related_name='versions')

    __repr__ = sane_repr('workdefinition_id', 'version', 'latest')
