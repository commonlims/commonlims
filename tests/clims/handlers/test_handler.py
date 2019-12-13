from __future__ import absolute_import

from mock import MagicMock
from sentry.testutils import TestCase

from clims.handlers import Handler


class TestHandler(TestCase):
    def _create_handler(self):
        context = MagicMock()
        app = MagicMock()
        return Handler(context, app)

    def test_can_create_handler(self):
        self._create_handler()

    def test_can_add_validation_issue(self):
        handler = self._create_handler()
        handler.validation_debug("debug message")
        handler.validation_info("info message")
        handler.validation_warning("warning message")

        assert len(handler.validation_issues) == 3
        assert not handler.has_validation_errors

    def test_can_add_validation_error(self):
        handler = self._create_handler()
        handler.validation_error("error message")
        assert len(handler.validation_issues) == 1
        assert handler.has_validation_errors
