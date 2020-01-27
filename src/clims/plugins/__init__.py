from __future__ import absolute_import


class PluginError(Exception):
    # Base class for all errors thrown by a plugin
    pass


class PluginValidationError(PluginError):
    """
    This exception should be raised when there are validation errors that can not be treated by
    a plugin. At that time, all execution will stop.

    Other validation issues (warnings, info and debug messages) can also be included in the issue
    list.
    """

    def __init__(self, msg, validation_issues):
        super(PluginValidationError, self).__init__(msg)

        self.validation_issues = validation_issues
