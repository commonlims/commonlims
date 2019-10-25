from __future__ import absolute_import

from django.db import models

from sentry.db.models import FlexibleForeignKey, Model, sane_repr
from openpyxl import load_workbook


class StructuredFileMixin(object):
    """
    A helper mixin for allowing plugin developers to easily parse files to common formats
    without having to import requirements etc.
    """

    def as_excel(self, temp_file, read_only=True):
        """
        Returns the file as an excel file. The caller has the responsibility to
        delete the temp file after usage!
        """
        with open(temp_file.name, 'wb') as f:
            for _, chunk in enumerate(self.file.getfile()):
                f.write(chunk)

        workbook = load_workbook(temp_file.name, data_only=True, read_only=read_only)

        return workbook

    def as_xml(self):
        raise NotImplementedError()

    def as_csv(self):
        # TODO: Add @lru_cache to the method when ready
        from clims.services.file_service.csv import Csv
        return Csv(self.file.getfile(), file_name=self.file.name)


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
