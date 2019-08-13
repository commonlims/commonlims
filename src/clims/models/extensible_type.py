from __future__ import absolute_import


from django.db import models
from sentry.db.models import (Model, FlexibleForeignKey, sane_repr)


class ExtensibleType(Model):
    """
    Lists the types of items available. ItemTypes are registered by plugins. Examples are
    `sample` registered by clims_plugin and `index_tag` registered by clims_genetics.
    """
    __core__ = True

    name = models.TextField(null=False)
    plugin_registration = FlexibleForeignKey('clims.PluginRegistration', null=False)

    # The base class that defines the unextended model. For now this is one of [Substance, Project, Container].
    # TODO: It would be helpful if the namespace would be clims.Project rather than sentry.Project
    base_class = models.TextField(null=False)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_extensibletype'

    __repr__ = sane_repr('name')
