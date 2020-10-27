from __future__ import absolute_import
import pytest
from sentry.testutils import TestCase
from clims.services.workbatch import WorkBatchBase
from StringIO import StringIO


class TestWorkBatch(TestCase):
    def setUp(self):
        self.has_context()
        self.register_extensible(WorkBatchBase)

    def test__add_file_to_work_batch__file_is_fetched_from_workbatch_by_file_handle(self):
        # Arrange
        work_batch = WorkBatchBase.create(name='workbatch1')
        file_stream = StringIO('contents')

        # Act
        work_batch.add_file(
            file_stream=file_stream,
            name='abc',
            file_handle='file-handle'
        )
        fetched_file = work_batch.get_single_file(file_handle='file-handle')

        # Assert
        assert fetched_file.contents == 'contents'

    def test_fetch_workbatchfile__when_there_is_none__excpetion(self):
        # Arrange
        work_batch = WorkBatchBase.create(name='workbatch1')

        # Act
        # Assert
        with pytest.raises(ValueError):
            work_batch.get_single_file(file_handle='file-handle')

    @pytest.mark.dev_edvard
    def test_fetch_single_workbatchfile__when_two_files_were_added__excpetion(self):
        # Arrange
        work_batch = WorkBatchBase.create(name='workbatch1')
        file_stream = StringIO('contents')
        work_batch.add_file(file_stream=file_stream, name='abc1', file_handle='file-handle')
        work_batch.add_file(file_stream=file_stream, name='abc2', file_handle='file-handle')

        # Act
        # Assert
        with pytest.raises(ValueError):
            work_batch.get_single_file(file_handle='file-handle')
