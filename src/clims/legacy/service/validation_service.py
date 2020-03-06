

import logging
from clims.legacy.domain.validation import ValidationType, UsageError
from clims.legacy.service.step_logger_service import AggregatedStepLoggerService


class ValidationService:

    def __init__(self, step_logger_service, logger=None):
        self.logger = logger or logging.getLogger(__name__)
        self.step_logger_service = AggregatedStepLoggerService(step_logger_service)
        self.warning_count = 0
        self.error_count = 0
        self.messages = set()

    def add_separate_warning_step_log(self, step_logger_service):
        self.step_logger_service.warnings_step_logger_service = step_logger_service

    def add_separate_error_step_log(self, step_logger_service):
        self.step_logger_service.errors_step_logger_service = step_logger_service

    def handle_validation(self, results):
        """
        Pushes validation results to the logging framework
        """
        if len(results) > 0:
            self._log_debug("Validation errors, len = {}".format(len(results)))
            for result in results:
                self._log_debug(result)
                self.handle_single_validation(result)
        # If any of the validation results were errors, raise an exception:
        if any(result for result in results if result.type == ValidationType.ERROR):
            raise UsageError(
                "Errors during validation. See the step log for further details.",
                results)

    def handle_single_validation(self, result):
        msg_row = "{}".format(result)
        if msg_row in self.messages:
            # Quick fix: the messages per transfers are often duplicated. Skip adding
            # them several times to the log.
            return
        self.messages.add(msg_row)
        self._log_debug("{}".format(msg_row))

        if result.type == ValidationType.ERROR:
            self.step_logger_service.error(msg_row)
            self.error_count += 1
        elif result.type == ValidationType.WARNING:
            self.step_logger_service.warning(msg_row)
            self.warning_count += 1
        else:
            self.step_logger_service.log(msg_row)

    def _log_debug(self, msg):
        if self.logger is not None:
            self.logger.debug(msg)
