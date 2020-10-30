from __future__ import absolute_import
import pytest
from sentry.testutils import TestCase
from clims.services.workbatch import WorkBatchBase
from StringIO import StringIO


class TestWorkBatch(TestCase):
    def setUp(self):
        self.has_context()
        self.register_extensible(MyWorkbatchImplementation)
        self.work_batch = MyWorkbatchImplementation(name='workbatch1')
        self.work_batch.save()

    def test__add_file_to_work_batch__file_is_fetched_from_workbatch_by_file_handle(self):
        # Arrange
        file_stream = StringIO('contents')

        # Act
        self.work_batch.add_file(
            file_stream=file_stream,
            name='abc',
            file_handle='file-handle'
        )
        fetched_file = self.work_batch.get_single_file(file_handle='file-handle')

        # Assert
        assert fetched_file.contents == 'contents'

    def test_fetch_workbatchfile__when_there_is_none__excpetion(self):
        # Arrange
        # Act
        # Assert
        with pytest.raises(ValueError):
            self.work_batch.get_single_file(file_handle='file-handle')

    @pytest.mark.dev_edvard
    def test_fetch_single_workbatchfile__when_two_files_were_added__excpetion(self):
        # Arrange
        file_stream = StringIO('contents')
        self.work_batch.add_file(file_stream=file_stream, name='abc1', file_handle='file-handle')
        self.work_batch.add_file(file_stream=file_stream, name='abc2', file_handle='file-handle')

        # Act
        # Assert
        with pytest.raises(ValueError):
            self.work_batch.get_single_file(file_handle='file-handle')


class MyWorkbatchImplementation(WorkBatchBase):
    pass
