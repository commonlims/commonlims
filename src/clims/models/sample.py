from __future__ import absolute_import, print_function

from django.db import models
from sentry.db.models import (Model, FlexibleForeignKey, sane_repr)

# TODO: We need latest django for this! Using a TextField for the POC
# from django.contrib.postgres.fields import JsonField


class Sample(Model):
    """
    Either an original sample or an aliquot.

    TODO: Make sure we have an audit trigger for this table.
    TODO: We need a lock for samples if we are to allow editing entries. An important thing
      is to think about how this looks to the plugin writer. They should be able to read the
      values of related objects and if they are read, we need to make sure that if they write,
      they will only be able to write if things haven't changed
    """
    __core__ = True

    # users can generate tokens without being application-bound
    project = FlexibleForeignKey('sentry.Project', null=True, related_name="samples")
    name = models.TextField(null=True)
    type = models.TextField(null=True)
    concentration = models.FloatField(null=True)
    volume = models.FloatField(null=True)
    custom_fields = models.TextField(null=True)

    depth = models.IntegerField(default=1)
    parents = models.ManyToManyField("self")
    version = models.IntegerField(default=1)

    # TODO: Unique key on this combination, no name with the same version and depth
    @property
    def full_name(self):
        """Since analytes (depth > 1) and different versions can have the same name as the original
        one can fully qualify the sample knowing the name, depth and version
        """
        return "{}:{}:{}".format(self.name, self.depth, self.version)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_sample'
        unique_together = (('project', 'name'), )

    __repr__ = sane_repr('project_id', 'name')
