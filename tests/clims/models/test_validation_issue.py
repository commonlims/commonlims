from __future__ import absolute_import

import pytest
from sentry.testutils import TestCase
from clims.models import ValidationIssue


class ValidationIssueModelTest(TestCase):
    def test_can_create_validation_issue_with_message_and_type_only(self):
        ValidationIssue("error", msg="Something")

    def test_can_not_create_an_issue_with_an_invalid_type(self):
        with pytest.raises(AssertionError):
            ValidationIssue("something", msg="Something")
