
import os
import tests
import pytest
from six import BytesIO
import io
import logging
from tests.clims.models.test_substance import SubstanceTestCase
from clims.models.substance import Substance
from sentry.plugins import plugins
from sentry.testutils import TestCase
from clims.handlers import SubstancesSubmissionHandler
from clims.services import Csv
from clims.services.project import ProjectBase
from clims.services.extensible import TextField
from tests.fixtures.plugins.gemstones_inc.models import GemstoneSample
from clims.services.exceptions import DoesNotExist
import random


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
        plugins.handlers.add_handler_implementation(SubstancesSubmissionHandler, MyHandler)

    def test_run_gemstone_sample_submission_handler__with_csv__6_samples_found_in_db(self):
        # Arrange
        content = read_binary_file(csv_sample_submission_path())
        fileobj = io.BytesIO(content)

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


class TestSubstanceService(TestCase):
    def setUp(self):
        self.register_extensible(GemstoneProject)
        self.register_extensible(GemstoneSample)

    def test_get_substances_by_project__with_2_samples_in_project_and_1_outside__2_hits(self):
        # Arrange
        project1 = GemstoneProject(name='project1', organization=self.organization)
        project1.save()
        project2 = GemstoneProject(name='project2', organization=self.organization)
        project2.save()
        sample1 = GemstoneSample(name='sample1', organization=self.organization, project=project1)
        sample1.save()
        sample2 = GemstoneSample(name='sample2', organization=self.organization, project=project1)
        sample2.save()
        sample3 = GemstoneSample(name='sample3', organization=self.organization, project=project2)
        sample3.save()

        # Act
        fetched_samples = self.app.substances.filter(project=project1)

        # Assert
        assert len(fetched_samples) == 2
        assert {'sample1', 'sample2'} == set([s.name for s in fetched_samples])

    def test_filter_substances_by_project_name__with_2_samples_in_project_and_1_outside__2_hits(self):
        # Arrange
        project1 = GemstoneProject(name='project1', organization=self.organization)
        project1.save()
        project2 = GemstoneProject(name='project2', organization=self.organization)
        project2.save()
        sample1 = GemstoneSample(name='sample1', organization=self.organization, project=project1)
        sample1.save()
        sample2 = GemstoneSample(name='sample2', organization=self.organization, project=project1)
        sample2.save()
        sample3 = GemstoneSample(name='sample3', organization=self.organization, project=project2)
        sample3.save()

        # Act
        fetched_samples = self.app.substances.filter_by_project(project_name=project1.name)

        # Assert
        assert len(fetched_samples) == 2
        assert {'sample1', 'sample2'} == set([s.name for s in fetched_samples])

    def test_filter_substance_by_project_name__with_only_1_sample__sample_property_works(self):
        # Arrange
        project1 = GemstoneProject(name='project1', organization=self.organization)
        project1.save()
        sample1 = GemstoneSample(name='sample1', organization=self.organization, project=project1)
        sample1.color = 'red'
        sample1.save()

        # Act
        fetched_samples = self.app.substances.filter_by_project(project_name=project1.name)

        # Assert
        assert len(fetched_samples) == 1
        assert fetched_samples[0].color == 'red'

    def create_a_bunch_of_sample(self):
        project1 = GemstoneProject(name='project1', organization=self.organization)
        project1.save()

        color_choices = set(['red', 'blue', 'green'])
        color_list = []
        for i in range(0, 100):
            sample = GemstoneSample(name='sample{}'.format(i), organization=self.organization, project=project1)
            color_pick = random.choice(list(color_choices))
            color_list.append(color_pick)
            sample.color = color_pick
            sample.save()
        return color_list

    def test_get_unique_values_of_property(self):
        color_choices = set(self.create_a_bunch_of_sample())
        actual = self.app.substances.get_unique_values_of_property(property='color')

        assert actual == color_choices

    def test_get_values_of_property(self):
        color_list = self.create_a_bunch_of_sample()
        actual = self.app.substances.get_values_of_property(property='color')
        assert sorted(actual) == sorted(color_list)

    def test_get_values_of_nonexistent_property(self):
        self.create_a_bunch_of_sample()
        with pytest.raises(DoesNotExist):
            self.app.substances.get_values_of_property(property='date')


class GemstoneProject(ProjectBase):
    species = TextField("species")
    country_of_sampling = TextField("country_of_sampling")


class MyHandler(SubstancesSubmissionHandler):
    def __init__(self, context, app):
        super(MyHandler, self).__init__(context, app)

    def handle(self, multi_format_file):
        csv = self._as_csv(multi_format_file)
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
            workbook = file_obj.as_excel()
            csv = self._xlsx_to_csv(workbook)
        else:
            _, ext = os.path.splitext(file_obj.name)
            NotImplementedError('File type not recognized: {}'.format(ext))
        return csv

    def _xlsx_to_csv(self, excel_workbook):
        sample_list_sheet = excel_workbook['Samples']
        rows = []
        for row in sample_list_sheet.iter_rows(min_row=3):
            line_contents = [str(cell.value) for cell in row]
            line = '\t'.join(line_contents)
            rows.append(line)
        contents = '\n'.join(rows)
        file_like = io.StringIO(contents)
        return Csv(file_like, delim='\t')
