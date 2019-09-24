from __future__ import absolute_import, print_function

from django.db import models
from sentry.db.models import (Model, FlexibleForeignKey, sane_repr)


class Substance(Model):
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

    NOTE: It's currently not supported to change the original name of the substance, but a plugin
    can specify a versioned name property that can be changed.
    """
    __core__ = True

    def __init__(self, *args, **kwargs):
        super(Substance, self).__init__(*args, **kwargs)

    name = models.TextField()

    version = models.IntegerField(default=1)

    organization = FlexibleForeignKey('sentry.Organization')

    project = FlexibleForeignKey('sentry.Project', null=True)

    extensible_type = FlexibleForeignKey('clims.ExtensibleType')

    # The depth of the substance. Depth is increased by one for a copy.
    depth = models.IntegerField(default=1)

    # The original substance or substances (e.g. in the case of pools) this
    # substance originates from
    origins = models.ManyToManyField('clims.Substance')

    properties = models.ManyToManyField('clims.ExtensibleProperty')

    parents = models.ManyToManyField('self', related_name='children')

    __repr__ = sane_repr('name', 'version', 'organization_id', 'extensible_type_id')

    class Meta:
        app_label = 'clims'
        db_table = 'clims_substance'
        unique_together = ('name', 'organization', 'extensible_type')
