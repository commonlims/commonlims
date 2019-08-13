from __future__ import absolute_import


from django.db import models
from sentry.db.models import (Model, FlexibleForeignKey, sane_repr)
from clims.models.property_type import PropertyType


class PropertyInstance(Model):
    """
    Defines a value for a property

    The value fields are mutually exclusive, only one can be defined.
    """
    __core__ = True

    property_type = FlexibleForeignKey('clims.PropertyType', null=False)

    # Supported values:
    float_value = models.FloatField(null=True)
    int_value = models.IntegerField(null=True)
    string_value = models.TextField(null=True)
    # bool_value = models.BooleanField(null=True)

    instance = FlexibleForeignKey('clims.ExtensibleInstance', null=False, related_name='properties')
    version = models.IntegerField(null=False, default=1)

    # True if this is the latest version of this instance
    latest = models.BooleanField(null=False, default=True)

    def __init__(self, *args, **kwargs):
        super(PropertyInstance, self).__init__(*args, **kwargs)
        self._value_before_update = self.value

    @property
    def value(self):
        raw_type = self.property_type.raw_type
        if raw_type == PropertyType.INT:
            return self.int_value
        elif raw_type == PropertyType.FLOAT:
            return self.float_value
        elif raw_type == PropertyType.STRING:
            return self.string_value
        elif raw_type == PropertyType.BOOL:
            return self.bool_value
        else:
            raise ValueError("Unexpected raw type {}".format(raw_type))

    @value.setter
    def value(self, value):
        raw_type = self.property_type.raw_type
        if raw_type == PropertyType.INT:
            self.int_value = value
        elif raw_type == PropertyType.FLOAT:
            self.float_value = value
        elif raw_type == PropertyType.STRING:
            self.string_value = value
        elif raw_type == PropertyType.BOOL:
            self.bool_value = value
        else:
            raise ValueError("Unexpected raw type {}".format(raw_type))

    def save(self, *args, **kwargs):
        """
        Saving a property instance always means:

        * Update the previous version so it's not marked as latest
        * Increase the version number by one
        """

        # TODO: It seems that the IDs are jumping quite a bit here. Look into why that happens

        if self.value != self._value_before_update and self.pk:
            self.latest = False
            new_value = self.value
            self.value = self._value_before_update
            super(Model, self).save(*args, **kwargs)

            # We always create a new copy with an increased version number
            self.pk = None
            self.version += 1
            self.latest = True
            self.value = new_value

        # Regular safe if this is the first time we're saving, i.e. self.pk is None
        super(Model, self).save(*args, **kwargs)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_propertyinstance'
        unique_together = (
            ('instance', 'version')
        )

    __repr__ = sane_repr('version', 'value', 'latest')
