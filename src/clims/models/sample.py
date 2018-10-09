from __future__ import absolute_import, print_function

from django.db import models
from sentry.db.models import (Model, FlexibleForeignKey, sane_repr)


class Sample(Model):
    """
    Sample or aliquot
    """
    __core__ = True

    # users can generate tokens without being application-bound
    project = FlexibleForeignKey('sentry.Project', null=True)
    name = models.TextField(null=True)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_sample'
        unique_together = (('project', 'name'), )

    __repr__ = sane_repr('project_id', 'name')

    # TODO:
    # def get_scopes(self):
    #     if self.scope_list:
    #         return self.scope_list
    #     return [k for k, v in six.iteritems(self.scopes) if v]
    #
    # def has_scope(self, scope):
    #     return scope in self.get_scopes()
