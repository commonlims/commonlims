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
    parent = FlexibleForeignKey('clims.Container', null=True, related_name="children_set")

    # TODO: Benefits of FlexibleForeignKey
    # TODO: Decide on naming for related_name
    container_type = FlexibleForeignKey('clims.ContainerType', null=True, related_name="containers")
    name = models.TextField(null=True)

    class Meta:
        app_label = 'sentry'
        db_table = 'sentry_container'

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
    __core__ = True

    # TODO: limited char field
    name = models.TextField(null=True)
    rows = models.IntegerField('rows')
    cols = models.IntegerField('cols')

    # To support freezers (and any other 3D containers, we also support levels, which by
    # default is 1
    levels = models.IntegerField('levels', default=1)

    class Meta:
        app_label = 'sentry'
        db_table = 'sentry_container_type'

    __repr__ = sane_repr('name')


class ContainerLocationProperties(Model):
    """
    Properties for a container location (e.g. a well). Used to e.g.
    """
    __core__ = True

    # Specifies that this location is not allowed
    allowed = models.BooleanField('allowed')
    container_type = FlexibleForeignKey('clims.ContainerType')
