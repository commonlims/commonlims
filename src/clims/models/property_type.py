from __future__ import absolute_import


from django.db import models
from sentry.db.models import (Model, FlexibleForeignKey, sane_repr)


class PropertyType(Model):
    """
    Defines a property on an Item.

    At its base, an Item (e.g. a sample) doesn't have any properties. They are all defined in plugins.
    """
    __core__ = True

    name = models.TextField(null=False)

    STRING = 's'
    JSON = 'j'
    INT = 'i'
    FLOAT = 'f'
    BOOL = 'b'

    TYPE_CHOICES = (
        (STRING, 'string'),
        (JSON, 'json'),
        (INT, 'int'),
        (FLOAT, 'float'),
        (BOOL, 'bool'),
    )

    raw_type = models.TextField(
        choices=TYPE_CHOICES,
        null=False,
    )

    # To which kinds of item can one bind this property (e.g. sample, pool)
    extensible_type = FlexibleForeignKey('clims.ExtensibleType', null=False)

    # How should this property be displayed in the UI
    # TODO: Not strictly necessary as this would also be in the plugin code
    display_name = models.TextField(null=False)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_propertytype'

    __repr__ = sane_repr('name')
