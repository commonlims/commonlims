from __future__ import absolute_import
import os
from abc import abstractmethod
from django.db import models
from tempfile import NamedTemporaryFile
from sentry.db.models import FlexibleForeignKey, Model, sane_repr
from openpyxl import load_workbook


class FileContextBase(object):
    @abstractmethod
    def initiate(self):
        pass

    @abstractmethod
    def cleanup(self):
        pass

    @property
    @abstractmethod
    def file_path(self):
        pass

    @property
    @abstractmethod
    def file_name(self):
        pass


class OrganizationFileContext(FileContextBase):
    def __init__(self, organization_file):
        self._organization_file = organization_file
        self._temp_file = None
        self._temp_file_name = None  # for testing

    def initiate(self):
        self._temp_file = NamedTemporaryFile(suffix='.xlsx')
        self._temp_file_name = self._temp_file.name

        with open(self._temp_file.name, 'wb') as f:
            for _, chunk in enumerate(self._organization_file.file.getfile()):
                f.write(chunk)

    def cleanup(self):
        os.remove(self._temp_file.name)

    @property
    def file_path(self):
        return self._temp_file.name

    @property
    def file_name(self):
        return self._organization_file.name


class HarddiskFileContext(FileContextBase):
    def __init__(self, file_path):
        self._file_path = file_path

    def initiate(self):
        pass

    def cleanup(self):
        pass

    @property
    def file_path(self):
        return self._file_path

    @property
    def file_name(self):
        return os.path.basename(self._file_path)


class MultiFormatFile(object):
    """
    Wraps an organization file in order to generate any file format from it.
    This functionality is wrapped in a separate class because excel handling
    needs a temporary file that needs to be removed after usage.
    """

    def __init__(self, file_context):
        self.file_context = file_context
        self.file_path = None

    def __enter__(self):
        self.file_context.initiate()
        self.file_path = self.file_context.file_path
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.file_context.cleanup()

    @classmethod
    def from_path(cls, file_path):
        file_context = HarddiskFileContext(file_path)
        return MultiFormatFile(file_context=file_context)

    @classmethod
    def from_organization_file(cls, organization_file):
        file_context = OrganizationFileContext(organization_file)
        return MultiFormatFile(file_context=file_context)

    def as_excel(self, read_only=True):
        self._validate_file_path()
        workbook = load_workbook(self.file_path, data_only=False, read_only=read_only)

        return workbook

    @property
    def name(self):
        return self.file_context.file_name

    def as_xml(self):
        raise NotImplementedError()

    def as_csv(self):
        self._validate_file_path()
        from clims.services.file_service.csv import Csv
        return Csv(self.file_path, file_name=self.file_context.file_name)

    def _validate_file_path(self):
        if self.file_path is None:
            raise AssertionError('MultiFormatFile must be initiated as a context manager '
                                 'in order to export excel files, e.g. '
                                 'with MultiFormatFile(org_file) as wrapped: ...')


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
