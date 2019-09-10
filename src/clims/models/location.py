from __future__ import absolute_import


from django.db import models
from sentry.db.models import (Model, FlexibleForeignKey, sane_repr)


class Location(Model):
    """
    The [x, y, z] location in a container.

    Both `Substance`s and `Container`s can be located within a `Container`.
    """
    __core__ = True

    # The previous location of the item. If this is null, the item has never been moved since
    # it was created.
    container = FlexibleForeignKey('Container', null=False)

    # The 0-based coordinates, x, y and z.
    # The meaning of these is container specific.
    x = models.IntegerField(null=False, default=0)
    y = models.IntegerField(null=False, default=0)
    z = models.IntegerField(null=False, default=0)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_location'

    __repr__ = sane_repr('x', 'y', 'z')
