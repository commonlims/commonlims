from __future__ import absolute_import

import pytest
from sentry.testutils import APITestCase


class ProcessAssignmentTest(APITestCase):
    endpoint = 'clims-api-0-process-assignments'

    @pytest.mark.xfail
    def test_post(self):
        raise NotImplementedError()
