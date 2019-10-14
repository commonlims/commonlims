from __future__ import absolute_import, print_function

from django.db import models
from sentry.db.models import (Model, FlexibleForeignKey, sane_repr)

from clims.models.extensible import ExtensibleModel, ExtensibleVersion


class Container(ExtensibleModel):
    """
    Represents a container for either a Sample or another Container. Containers can be of any
    type defined in ContainerType.
    """
    __core__ = True

    # Parent is the container in which this Container lies. If null, it lies in no container.
    parent = FlexibleForeignKey('Container', null=True, related_name="children_set")

    # TODO: Benefits of FlexibleForeignKey
    # TODO: Decide on naming for related_name
    container_type = FlexibleForeignKey('ContainerType', null=True, related_name="containers")

    name = models.TextField(null=True)

    organization = FlexibleForeignKey('sentry.Organization')

    class Meta:
        app_label = 'clims'
        db_table = 'clims_container'

    __repr__ = sane_repr('container_type_id', 'name')


class ContainerVersion(ExtensibleVersion):
    __core__ = True

    archetype = models.ForeignKey("clims.Container", related_name='versions')

    __repr__ = sane_repr('container_id', 'version', 'latest')


class ContainerType(Model):
    __core__ = True

    name = models.TextField(null=True)
    rows = models.IntegerField('rows')
    cols = models.IntegerField('cols')

    # To support freezers (and any other 3D containers, we also support levels, which by
    # default is 1
    levels = models.IntegerField('levels', default=1)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_container_type'

    __repr__ = sane_repr('name')
