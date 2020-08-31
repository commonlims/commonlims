from __future__ import absolute_import
from sentry.testutils import TestCase
from clims.services.file_handling.file_service import FileService, File


class TestFileService(TestCase):
    def setUp(self):
        self.has_context()

    def test_upload_file_and_get_it__contents_is_right(self):
        # Arrange
        file_service = FileService()
        file = File()
        file.contents = 'contents'
        file.name = 'myfilename.txt'

        # Act
        uploaded = file_service.upload(file)
        fetched_contents = file_service.get_file_contents(uploaded.id)

        # Assert
        assert fetched_contents == 'contents'
