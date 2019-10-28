from __future__ import absolute_import
import os
from django.db import models
from tempfile import NamedTemporaryFile
from sentry.db.models import FlexibleForeignKey, Model, sane_repr
from openpyxl import load_workbook


class MultiFormatFile(object):
    """
    Wraps an organization file in order to generate any file format from it.
    This functionality is wrapped in a separate class because excel handling
    needs a temporary file that needs to be removed after usage.
    """

    def __init__(self, organization_file):
        self.temp_file = None
        self.organization_file = organization_file
        self.name = organization_file.name
        self.temp_file_name = None  # for testing

    def __enter__(self):
        self.temp_file = NamedTemporaryFile(suffix='.xlsx')
        self.temp_file_name = self.temp_file.name
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        os.remove(self.temp_file.name)

    def as_excel(self, read_only=True):
        if self.temp_file is None:
            raise AssertionError('MultiFormatFile must be initiated as a context manager '
                                 'in order to export excel files, e.g. '
                                 'with MultiFormatFile(org_file) as wrapped: ...')
        with open(self.temp_file.name, 'wb') as f:
            for _, chunk in enumerate(self.organization_file.file.getfile()):
                f.write(chunk)

        workbook = load_workbook(self.temp_file.name, data_only=True, read_only=read_only)

        return workbook

    def as_xml(self):
        raise NotImplementedError()

    def as_csv(self):
        # TODO: Add @lru_cache to the method when ready
        from clims.services.file_service.csv import Csv
        return Csv(self.organization_file.file.getfile(),
                   file_name=self.organization_file.file.name)


class OrganizationFile(Model):
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
