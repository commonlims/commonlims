from __future__ import absolute_import
from sentry.testutils import TestCase
import os
from clims.models.file import MultiFormatFile


class TestFile(TestCase):
    def test_use_multi_format_file__as_context_manager__internal_temp_file_deleted_after_usage(self):
        # Arrange
        org_file = FakeOrgFile()

        # Act
        with MultiFormatFile(org_file) as wrapped:
            temp_file_name = wrapped._temp_file_name
            assert os.path.exists(temp_file_name)

        # Assert
        assert not os.path.exists(temp_file_name)

    def test_use_multi_format_file__without_context_manager__no_internal_temp_file_created(self):
        # Arrange
        org_file = FakeOrgFile()

        # Act
        wrapped = MultiFormatFile(org_file)

        # Assert
        assert wrapped._temp_file is None
        assert wrapped._temp_file_name is None


class FakeOrgFile:
    def __init__(self):
        self.name = None
