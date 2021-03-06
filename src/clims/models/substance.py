from __future__ import absolute_import, print_function

from django.db import models
from sentry.db.models import (FlexibleForeignKey, sane_repr)
from clims.models.extensible import ExtensibleModel, ExtensibleVersion
from clims.models.work_batch import WorkBatch


class Substance(ExtensibleModel):
    """
    A substance is a model that describe primarily samples and aliquots but they
    can also represent other elements that can be combined with a sample or aliquot to make
    another substance.

    Substances can have plugin-defined key/values which are defined in `ExtensibleProperty`
    instances. All of these extra properties have a detailed version history that can be directly
    retrieved through the API.

    NOTE: Use the substances service class (`from clims.services import substances`) to create or
    update substances and properties as otherwise business rules will be broken, e.g. you might
    update a substance but not its properties.
    """
    __core__ = True

    def __init__(self, *args, **kwargs):
        super(Substance, self).__init__(*args, **kwargs)

    name = models.TextField()

    organization = FlexibleForeignKey('sentry.Organization',
                                      related_name='substances')

    project = FlexibleForeignKey('clims.Project', null=True)

    # The original substance or substances (e.g. in the case of pools) this
    # substance originates from
    origins = models.ManyToManyField('clims.Substance')

    parents = models.ManyToManyField('clims.SubstanceVersion',
                                     related_name='children')

    # The depth of the extensible in the ancestry graph
    depth = models.IntegerField(default=1)

    work_batches = models.ManyToManyField(WorkBatch, related_name='substances')

    __repr__ = sane_repr('name', )

    class Meta:
        app_label = 'clims'
        db_table = 'clims_substance'
        unique_together = ('name', 'organization')


class SubstanceVersion(ExtensibleVersion):
    __core__ = True

    archetype = models.ForeignKey("clims.Substance", related_name='versions')

    __repr__ = sane_repr('archetype_id', 'version', 'latest')
