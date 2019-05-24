from __future__ import absolute_import

import logging
import sys
import time
from clims.legacy.service.file_service import SharedFileNotFound
from clims.legacy.utils import lazyprop


class StepLoggerService:
    """
    Provides support for logging to shared files in a step.
    """

    def __init__(self, file_handle, file_service, raise_if_not_found=False, append=True, extension="txt",
                 write_to_stdout=True, filename=None):
        self.core_logger = logging.getLogger(__name__)
        self.file_handle = file_handle
        if filename is None:
            self.filename = file_handle.replace(' ', '_')
        else:
            self.filename = filename
        self.file_service = file_service
        self.raise_if_not_found = raise_if_not_found
        self.append = append
        self.extension = extension
        self.write_to_stdout = write_to_stdout

        # Use Windows line endings for now, since most clients are currently Windows.
        # TODO: This should be configurable.
        self.NEW_LINE = "\r\n"

    @lazyprop
    def step_log(self):
        try:
            mode = "ab" if self.append else "wb"
            return self.file_service.local_shared_file_search_or_create(self.file_handle,
                                                                        extension=self.extension,
                                                                        mode=mode,
                                                                        modify_attached=True,
                                                                        filename=self.filename)
        except SharedFileNotFound:
            if self.raise_if_not_found:
                raise
            else:
                return None

    def _log(self, level, msg):
        time_str = time.strftime("%Y-%m-%d %H:%M:%S")
        msg = "{} - {}".format(time_str, msg)
        if self.step_log:
            # TODO: Get formatting from the core logging framework
            try:
                if level:
                    self.step_log.write(
                        "{} - {}".format(logging.getLevelName(level), msg + self.NEW_LINE))
                else:
                    self.step_log.write("{}".format(msg + self.NEW_LINE))
            except ValueError:
                # Temporary error handling for when we try to write to the step log and it
                # has already been closed
                pass

        # Forward to the core logger:
        if level:
            self.core_logger.log(level, msg)
        elif self.write_to_stdout:
            # Forward to stdout for dev
            sys.stdout.write("STEPLOG> {}\n".format(msg))

    def error(self, msg):
        self._log(logging.ERROR, msg)

    def warning(self, msg):
        self._log(logging.WARNING, msg)

    def info(self, msg):
        self._log(logging.INFO, msg)

    def log(self, msg):
        # Logs without forwarding to the core logger, and without any formatting
        self._log(None, msg)

    def get(self, name):
        # This factory method is added for readability in the extensions.
        return StepLoggerService(name, self.file_service, raise_if_not_found=True, append=False)


class AggregatedStepLoggerService:
    """
    Contains a list of step logger services, and have the same interface as
    StepLoggerService.
    Errors and warnings are written to step logs dedicated to the respective type
    """

    def __init__(self, default_step_logger_service, warnings_step_logger_service=None,
                 errors_step_logger_service=None):
        self.default_step_logger_service = default_step_logger_service
        self.step_logger_name = default_step_logger_service.file_handle
        self.warnings_step_logger_service = warnings_step_logger_service
        self.errors_step_logger_service = errors_step_logger_service

    def error(self, msg):
        self.default_step_logger_service.error(msg)
        if self.errors_step_logger_service is not None:
            self.errors_step_logger_service.error(msg)

    def warning(self, msg):
        self.default_step_logger_service.warning(msg)
        if self.warnings_step_logger_service is not None:
            self.warnings_step_logger_service.warning(msg)

    def info(self, msg):
        self.default_step_logger_service.info(msg)

    def log(self, msg):
        self.default_step_logger_service.log(msg)

    def get(self, name):
        # This factory method is added for readability in the extensions.
        return StepLoggerService(
            name, self.default_step_logger_service.file_service, raise_if_not_found=True, append=False)
