from __future__ import absolute_import
import re
from six import StringIO
from sentry.models.file import File as DjangoFile
from clims.models.file import OrganizationFile
from clims.handlers import context_store


FILENAME_RE = re.compile(r"[\n\t\r\f\v\\]")


class FileNameValidationError(Exception):
    pass


class FileService(object):
    def upload(self, file):
        file_stream = StringIO(file.contents)
        return self.create_organization_file(
            file_stream, file.name, context_store.current.organization.id)

    def get_file_contents(self, id):
        # TODO: get by name, make name unique
        org_file = OrganizationFile.objects.get(id=id)
        file = org_file.file
        with file.getfile() as fp:
            contents = fp.read()

        return contents

    def create_organization_file(self, file_stream, name, organization_id, file_type=None):
        """
        Uploads file to the server and wrap it in a organization file
        """
        if FILENAME_RE.search(name):
            raise FileNameValidationError('File name must not contain special whitespace characters')

        if not file_type:
            file_type = 'default'

        file_model = DjangoFile.objects.create(
            name=name,
            type=file_type,
            headers=list(),
        )

        file_stream.seek(0)
        file_model.putfile(file_stream)

        org_file = OrganizationFile.objects.create(
            organization_id=organization_id,
            file=file_model,
            name=name,
        )
        return org_file


class File(object):
    def __init__(self):
        self.contents = None
        self.name = None

    def validate(self):
        if self.contents is None:
            raise ValueError("The file contents is not initialized")
        if self.name is None:
            raise ValueError("The file name is not set")
