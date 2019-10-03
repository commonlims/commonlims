from __future__ import absolute_import
import os
import tests
from six import BytesIO
from sentry.testutils import TestCase
from sentry.models.file import File
from clims.models.file import OrganizationFile
from clims.models.substance import Substance
from sentry_plugins.snpseq.plugin.handlers import GemstoneSubstancesSubmission  # change-this
from tests.clims.testutils import create_organization
from tests.clims.testutils import create_substance_type


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


class TestGemstoneSampleSubmission(TestCase):
    def setUp(self):
        self.org = create_organization()
        self.gemstone_sample_type = create_substance_type(org=self.org)

    def _create_organization_file(self, file_path):
        name = os.path.basename(file_path)
        file_model = File.objects.create(
            name=name,
            type='substance-batch-file',
            headers=list(),
        )
        contents = read_binary_file(file_path)
        file_like_obj = BytesIO(contents)
        file_model.putfile(file_like_obj)
        return OrganizationFile(name=name, organization=self.org, file=file_model)

    def test_run_gemstone_sample_submission_handler__with_csv__6_samples_found_in_db(self):
        # Arrange
        handler = GemstoneSubstancesSubmission()
        sample_sub_file = self._create_organization_file(csv_sample_submission_path())

        # Act
        handler.handle(sample_sub_file)

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
        file = self._create_organization_file(xlsx_sample_submission_path())
        handler = GemstoneSubstancesSubmission()

        # Act
        handler.handle(file)

        # Assert
        all_samples = Substance.objects.all()
        all_sample_names = [sample.name for sample in all_samples]
        expected_sample_names = [
            'sample-Frink-1693_1',
            'sample-Frink-1693_2',
            'sample-Frink-1693_3',
        ]
        assert set(expected_sample_names).issubset(set(all_sample_names))
