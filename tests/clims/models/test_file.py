from __future__ import absolute_import
from sentry.testutils import TestCase
import os
from clims.models.file import MultiFormatFile


class TestFile(TestCase):
    def test_use_multi_format_file__as_context_manager__internal_temp_file_deleted_after_usage(self):
        # Arrange
        org_file = FakeOrgFile()

        # Act
        with MultiFormatFile.from_organization_file(org_file) as file:
            temp_file_name = file.file_context._temp_file_name
            assert os.path.exists(temp_file_name)

        # Assert
        assert not os.path.exists(temp_file_name)

    def test_use_multi_format_file__without_context_manager__no_internal_temp_file_created(self):
        # Arrange
        org_file = FakeOrgFile()

        # Act
        file = MultiFormatFile.from_organization_file(org_file)

        # Assert
        assert file.file_context._temp_file is None
        assert file.file_context._temp_file_name is None

    def test_use_multi_format_file__with_file_stream_initiation__internal_temp_file_deleted(self):
        # Arrange
        contents = 'abc'
        from six import BytesIO
        file_stream = BytesIO(contents)

        # Act
        # file/path.txt represents a path on the client computer.
        with MultiFormatFile.from_file_stream('file/path.txt', file_stream) as file:
            temp_file_name = file.file_context._temp_file.name
            assert os.path.exists(temp_file_name)
            assert file.name == 'path.txt'
            assert file.file_path != 'file/path.txt'  # file_path is the path to the temp file (on server)

        assert not os.path.exists(temp_file_name)


class FakeOrgFile:
    def __init__(self):
        self.name = None
        self.file = FakeFile()


class FakeFile:
    def getfile(self):
        return ' '
