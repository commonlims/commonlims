from __future__ import absolute_import
import pytest
import os
import tests
from six import BytesIO, binary_type
import StringIO
import logging
from tests.clims.models.test_substance import SubstanceTestCase
from clims.models.substance import Substance
from sentry.plugins import plugins
from clims.handlers import SubstancesSubmissionHandler
from clims.services import Csv
from tests.fixtures.plugins.gemstones_inc.models import GemstoneSample


def read_binary_file(path):
    with open(path, 'rb') as f:
        contents = f.read()
    return contents


def xlsx_sample_submission_path():
    tests_dir = os.path.dirname(tests.__file__)
    samples_dir = os.path.join(tests_dir, 'fixtures/samples')
    return os.path.join(samples_dir, 'gemstones-samplesubmission-unique-samples.xlsx')


def csv_sample_submission_path():
    tests_dir = os.path.dirname(tests.__file__)
    samples_dir = os.path.join(tests_dir, 'fixtures/samples')
    return os.path.join(samples_dir, 'gemstones-samplesubmission-matching-headers.csv')


class TestGemstoneSampleSubmission(SubstanceTestCase):
    def setUp(self):
        self.gemstone_sample_type = self.register_gemstone_type()
        logger = logging.getLogger('clims.files')
        logger.setLevel(logging.CRITICAL)

        # TODO: It would be cleaner to have the plugins instance in the ApplicationService
        plugins.load_handler_implementation(SubstancesSubmissionHandler, MyHandler)

    @pytest.mark.now
    def test_run_gemstone_sample_submission_handler__with_csv__6_samples_found_in_db(self):
        # Arrange
        content = read_binary_file(csv_sample_submission_path())
        fileobj = StringIO.StringIO(content)

        # Act
        self.app.substances.load_file(self.organization, "the_file.csv", fileobj)

        # Assert
        all_samples = Substance.objects.all()
        expected_sample_names = [
            'gemstone1-project1',
            'gemstone2-project1',
            'gemstone3-project1',
            'gemstone4-project1',
            'gemstone5-project1',
            'gemstone6-project1',
        ]
        all_sample_names = [sample.name for sample in all_samples]
        assert set(expected_sample_names).issubset(set(all_sample_names))

    def test_gemstone_submission_handler__with_xlsx__3_samples_found(self):

        # Arrange
        contents = read_binary_file(xlsx_sample_submission_path())
        fileobj = BytesIO(contents)

        # Act
        self.app.substances.load_file(self.organization, "the_file.xlsx", fileobj)

        # Assert
        all_samples = Substance.objects.all()
        all_sample_names = [sample.name for sample in all_samples]
        expected_sample_names = [
            'sample-Frink-1693_1',
            'sample-Frink-1693_2',
            'sample-Frink-1693_3',
        ]
        assert set(expected_sample_names).issubset(set(all_sample_names))


class MyHandler(SubstancesSubmissionHandler):
    def __init__(self, context, app):
        super(MyHandler, self).__init__(context, app)

    def handle(self, file_obj):
        csv = self._as_csv(file_obj)
        for line in csv:
            name = line['Sample ID']
            sample = GemstoneSample(name=name, organization=self.context.organization)
            sample.preciousness = line['Preciousness']
            sample.color = line['Color']
            sample.save()

    def _as_csv(self, file_obj):
        if file_obj.name.endswith('.csv'):
            csv = file_obj.as_csv()
        elif file_obj.name.endswith('.xlsx'):
            from tempfile import NamedTemporaryFile
            with NamedTemporaryFile(suffix='.xlsx') as temp_file:
                workbook = file_obj.as_excel(temp_file)
                csv = self._xlsx_to_csv(workbook)
        else:
            _, ext = os.path.splitext(file_obj.name)
            NotImplementedError('File type not recognized: {}'.format(ext))
        return csv

    def _xlsx_to_csv(self, excel_workbook):
        sample_list_sheet = excel_workbook['Samples']
        rows = []
        for row in sample_list_sheet.iter_rows(min_row=3):
            line_contents = [binary_type(cell.value) for cell in row]
            line = ','.join(line_contents)
            rows.append(line)
        contents = '\n'.join(rows)
        file_like = StringIO.StringIO(contents)
        return Csv(file_like)
