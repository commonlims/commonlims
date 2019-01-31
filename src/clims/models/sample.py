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


# WORKFLOW_ENGINE_CAMUNDA = 1
# class SampleWorkflows(Model):
#     """
#     Lists all sample level workflow instances for this sample
#
#     This model only knows about the mapping from samples to workflows. The workflow engine itself will
#     know the details about the status, but when the
#     """
#     __core__ = True
#
#     workflow_id = models.TextField(null=True)
#     workflow_engine = models.IntegerField(default=WORKFLOW_ENGINE_CAMUNDA)
#     sample = FlexibleForeignKey('clims.Sample', null=True)
#
#     # The workflow engine has more detail about the actual status of the workflow process. It's possible
#     # that the process is already inactive and it hasn't been synced yet.
#     #active = models.BooleanField()


class SampleBatch(Model):
    __core__ = True  # TODO: how is this used?
    pass
