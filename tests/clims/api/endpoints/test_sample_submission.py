from __future__ import absolute_import

import pytest
import tests
import os
import logging
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.urlresolvers import reverse
from sentry.testutils import APITestCase
from clims.models import OrganizationFile
from sentry.plugins import plugins


logger = logging.getLogger(__name__)


# TODO: add to baseclass
def get_fixture_path(path):
    full_path = "{}/fixtures/{}".format(os.path.dirname(tests.__file__), path)
    return full_path


class TestSampleSubmission(APITestCase):
    @pytest.mark.skip("TODO: Endpoint is currently using json instead of multipart.")
    def test_can_upload_sample_sheet(self):
        """
        Test that given a simple implementation of `ParseSubstancesBatchFileHandler` and
        `SubstancesImportHandler` works.
        """
        from tests.fixtures.plugins.gemstones import GemstonePlugin
        from tests.fixtures.plugins.gemstones_inc import GemstoneIncPlugin

        with open(get_fixture_path("samples/gemstones-samplesubmission.csv"), mode='rb') as f:
            content = f.read()
        # Register both plugins. Both have an implementation of
        plugins.register(GemstonePlugin)
        plugins.register(GemstoneIncPlugin)

        url = reverse(
            'clims-api-0-organization-substances-files',
            kwargs={'organization_slug': 'lab'}
        )
        self.login_as(self.user)
        response = self.client.post(
            url, {
                'name': 'submission.csv',
                'header': 'Extra-Info: extra',
                'file': SimpleUploadedFile(
                    'submission.csv', content,
                    content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                ),
            },
            format='multipart'
        )
        assert response.status_code == 201, response.content

        org_file = OrganizationFile.objects.get(name='submission.csv')

        assert org_file.file.headers == {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Extra-Info': 'extra',
        }
