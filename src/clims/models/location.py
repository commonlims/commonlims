from django.db import models
from sentry.db.models import (Model, FlexibleForeignKey, sane_repr)

# TODO: Add a class ContainerLocation that inherits from a common base


class SubstanceLocation(Model):
    """
    The [x, y, z] location of a substance or a container within a container.

    Both `Substance`s and `Container`s can be located within a `Container`.
    """
    __core__ = True

    # TODO: null=False
    container = FlexibleForeignKey('Container', null=True, related_name='substance_locations')

    # TODO: null=False
    substance = FlexibleForeignKey('Substance', null=True, related_name='locations')

    # The version of the container when the transition happened
    container_version = models.IntegerField(null=False, default=1)

    # The version of the substance when it was moved to this location
    substance_version = models.IntegerField(null=False, default=1)

    # The 0-based coordinates, x, y and z.
    # The meaning of these is container specific.
    x = models.IntegerField(null=False, default=0)
    y = models.IntegerField(null=False, default=0)
    z = models.IntegerField(null=False, default=0)

    current = models.BooleanField()

    @property
    def raw(self):
        return (self.x, self.y, self.z)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_substancelocation'

    __repr__ = sane_repr('x', 'y', 'z')
