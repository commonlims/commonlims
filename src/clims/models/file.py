from __future__ import absolute_import

from django.db import models

from sentry.db.models import FlexibleForeignKey, Model, sane_repr
from openpyxl import load_workbook
from functools32 import lru_cache


class StructuredFileMixin(object):
    """
    A helper mixin for allowing plugin developers to easily parse files to common formats
    without having to import requirements etc.
    """

    @lru_cache
    def as_excel(self):
        """
        Returns the file as an excel file
        """
        return load_workbook(self.file.getfile())

    @lru_cache
    def as_xml(self):
        raise NotImplementedError()

    def as_csv(self):
        # TODO: Add @lru_cache to the method when ready
        from clims.services import Csv
        return Csv(self.file.getfile())


class OrganizationFile(StructuredFileMixin, Model):
    """
    Connection between a `File` and an `Organization`.
    """
    __core__ = False

    organization = FlexibleForeignKey('sentry.Organization')
    file = FlexibleForeignKey('sentry.File')
    name = models.TextField()

    __repr__ = sane_repr('name')

    class Meta:
        index_together = (('name'), )
        app_label = 'clims'
        db_table = 'clims_organizationfile'
