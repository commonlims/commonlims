from __future__ import absolute_import, print_function

from django.db import models
from sentry.db.models import (Model, FlexibleForeignKey, sane_repr)


class Container(Model):
    """
    Represents a container for either a Sample or another Container. Containers can be of any
    type defined in ContainerType.
    """
    __core__ = True

    # Parent is the container in which this Container lies. If null, it lies in no container.
    parent = FlexibleForeignKey('clims.Container', null=True)
    # TODO: Is FlexibleForeignKey required? does it matter
    # TODO: Data migration for containers
    container_type = FlexibleForeignKey('clims.ContainerType', null=True)
    name = models.TextField(null=True)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_container'
        # unique_together = (('project', 'name'), )

    __repr__ = sane_repr('container_type_id', 'name')

    # TODO:
    # def get_scopes(self):
    #     if self.scope_list:
    #         return self.scope_list
    #     return [k for k, v in six.iteritems(self.scopes) if v]
    #
    # def has_scope(self, scope):
    #     return scope in self.get_scopes()


class ContainerType(Model):
    """
    """
    __core__ = True

    name = models.TextField(null=True)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_container_type'

    __repr__ = sane_repr('name')
