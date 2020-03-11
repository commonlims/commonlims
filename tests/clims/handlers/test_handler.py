from __future__ import absolute_import

import pytest
from mock import MagicMock
from sentry.testutils import TestCase

from clims.handlers import (Handler, HandlerManager, SubstancesSubmissionHandler,
        MultipleHandlersNotAllowed)


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


class TestHandlerValidation(TestCase):
    def test_raises_if_unique_handler_implemented_twice(self):
        """If a handler is marked with `unique_registration = True`, it should only load once"""

        app = MagicMock()
        handler_manager = HandlerManager(app)
        Handler1 = type("Somewhere.Handler1", (SubstancesSubmissionHandler,), {})
        Handler1.version = "1.0.0"
        Handler1.unique_registration = True

        Handler2 = type("Somewhere.Handler2", (SubstancesSubmissionHandler,), {})
        Handler2.version = "1.0.0"
        Handler2.unique_registration = True

        assert Handler1.unique_registration, \
            "Failed test setup assumption, SubstanceSubmissionHandler is no longer marked as unique"

        handler_manager.add_handler_implementation(SubstancesSubmissionHandler, Handler1)
        handler_manager.add_handler_implementation(SubstancesSubmissionHandler, Handler2)

        with pytest.raises(MultipleHandlersNotAllowed):
            handler_manager.validate()
