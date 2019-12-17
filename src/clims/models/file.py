from __future__ import absolute_import
import os
from abc import abstractmethod
from django.db import models
from tempfile import NamedTemporaryFile
from sentry.db.models import FlexibleForeignKey, Model, sane_repr
from openpyxl import load_workbook
from six import text_type
from six import string_types


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
    """
    In cases when referring to a file of which contents is stored in the database.
    """

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
        if self._temp_file:
            return self._temp_file.name
        return None

    @property
    def file_name(self):
        return self._organization_file.name


class FileStreamContext(FileContextBase):
    """
    In cases when the contents and client file path of a file
    is provided from a http request
    """

    def __init__(self, file_name, file_stream):
        self._file_stream = file_stream
        self._file_name = file_name
        self._temp_file = None

    def initiate(self):
        _, suffix = os.path.splitext(self._file_name)
        self._temp_file = NamedTemporaryFile(suffix=suffix)

        with open(self._temp_file.name, 'wb') as f:
            f.write(self._file_stream.read())

    def cleanup(self):
        os.remove(self._temp_file.name)

    @property
    def file_path(self):
        if self._temp_file:
            return self._temp_file.name
        return None

    @property
    def file_name(self):
        return self._file_name


class HarddiskFileContext(FileContextBase):
    """
    In cases when acting on a file that is already stored on the server file system,
    e.g. provide a demo file.
    """

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
    Wraps a file like object in order to generate any file format from it.
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

    @staticmethod
    def from_path(file_path):
        file_context = HarddiskFileContext(file_path)
        return MultiFormatFile(file_context=file_context)

    @staticmethod
    def from_file_stream(file_path, file_stream):
        file_name = os.path.basename(file_path)
        file_context = FileStreamContext(file_name, file_stream)
        return MultiFormatFile(file_context=file_context)

    @staticmethod
    def from_organization_file(organization_file):
        file_context = OrganizationFileContext(organization_file)
        return MultiFormatFile(file_context=file_context)

    def as_excel(self, read_only=True):
        self._validate_file_path()
        wb = load_workbook(self.file_path, data_only=False, read_only=read_only)
        wrapped_workbook = ClimsExcelFile(wb)
        return wrapped_workbook

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


class ClimsExcelFile:
    def __init__(self, workbook):
        self._workbook = workbook

    def __getitem__(self, sheet):
        return self._workbook[sheet]

    def read_cell(self, cell):
        """
        Converts the contents of an excel cell into string or None. Raise an exception
        for calculated fields.
        :param cell: openpyxl cell object
        :return: string or None
        """
        # This means that the cell contains a formula, which we do not support.
        if cell.data_type == 'f':
            raise ValueError('Excel calculated values are not supported! openpyxl uses cached '
                             'values for calculated fields, which are populated every last '
                             'time the doc is opened by MicroSoft Excel software. There is '
                             'currently no open-source software that evaluates Excel formulas')
        elif cell.value is None:
            return None
        elif isinstance(cell.value, string_types):
            return cell.value.encode('utf-8')
        else:
            return text_type(cell.value)

    def save(self, filename):
        self._workbook.save(filename)


class OrganizationFile(Model):
    """
    Organization file represent a file of which contents is stored in
    the database. It also shows a connection between a `File` and an `Organization`.
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
