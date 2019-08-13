from __future__ import absolute_import


from django.db import models
from sentry.db.models import (Model, FlexibleForeignKey, sane_repr)


class ItemLocation(Model):
    """
    The [x, y, z] location of a container. Points to a location in another Container.

    Containers can be within other containers, e.g. a plate in a freezer.
    """
    __core__ = True

    # The previous location of the item. If this is null, the item has never been moved since
    # it was created.
    container = FlexibleForeignKey('Container', null=False)
    previous_location = FlexibleForeignKey('ItemLocation', null=True)

    # The 0-based coordinates, x, y and z.
    # The meaning of these is container specific.
    x = models.IntegerField(null=False, default=0)
    y = models.IntegerField(null=False, default=0)
    z = models.IntegerField(null=False, default=0)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_itemlocation'

    __repr__ = sane_repr('x', 'y', 'z')
