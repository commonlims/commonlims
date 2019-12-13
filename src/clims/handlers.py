from __future__ import absolute_import

from clims.plugins import PluginValidationError


class RequiredHandlerNotFound(Exception):
    pass


class NoHandlerRegistered(Exception):
    pass


class MultipleHandlersNotAllowed(Exception):
    pass


class HandlerContext(object):
    """
    Has information on in which context a handler was called, e.g. what the current
    organization is etc.
    """

    def __init__(self, organization):
        self.organization = organization


class Handler(object):
    """
    The base class for handlers that are defined by plugins.

    Handlers are registered during the registration of all plugins. If there is no
    handler registered for a certain task, a `NoHandlerRegistered` error will be thrown.

    If a handler is marked with `unique_registration = True` and there are two or more handlers
    registered, a `MultipleHandlersNotAllowed` error will be thrown. In this case the user
    can decide which handler should run by adding this setting to `conf/server.py`:

        CLIMS_HANDLERS_KEEP_UNIQUE: [
            "SubstanceSubmissionHandler": "tinylab.plugins.first_plugin.handlers.SubmissionHandler"
        ]

    If a handler is marked with `unique_registration = False`, all handlers found will be executed
    in any order, except if a handler is found that has a subclass that's implementing it.
    """

    def __init__(self, context, app):
        self.app = app
        self.context = context

        # Warnings or info messages that should be shown to the user
        self.validation_issues = list()

    @property
    def has_validation_errors(self):
        return len([issue for issue in self.validation_issues if issue.type == "error"]) > 0

    def _add_validation_issue(self, type, msg, **kwargs):
        from clims.models import ValidationIssue
        kwargs["msg"] = msg
        self.validation_issues.append(ValidationIssue(type, **kwargs))

    def validation_debug(self, msg, **kwargs):
        self._add_validation_issue("debug", msg, **kwargs)

    def validation_info(self, msg, **kwargs):
        self._add_validation_issue("info", msg, **kwargs)

    def validation_warning(self, msg, **kwargs):
        """
        Adding warnings will not lead to an error being thrown. Instead, the caller should
        indicate to the user that these happened during processing.
        """
        self._add_validation_issue("warning", msg, **kwargs)

    def validation_error(self, msg, **kwargs):
        """
        If there is one or more validation error, an error will be thrown when the handler has
        run or when the user calls `raise_validation_error`
        """
        self._add_validation_issue("error", msg, **kwargs)

    def raise_validation_error(self, msg=None):
        """
        A convenience method for raising a `PluginValidationError` which will include the errors
        that have occurred during the execution of the handler.

        Note that users can also raise a `PluginValidationError` themselves

        This method is called automatically after running the handler, if there
        are any errors in `validation_issues`

        Note that warnings are never raised. They need to be treated specially by the caller.
        """
        if not msg:
            msg = "Validation errors occurred"
        raise PluginValidationError(msg, self.validation_issues)


class SubstancesValidationHandler(Handler):
    """
    Executed when a user submits a batch of substances, e.g. a list of samples
    in a project.
    """

    unique_registration = True

    def handle(self, multi_format_file):
        pass


class SubstancesSubmissionHandler(Handler):
    """
    Executed when a user submits a batch of substances, e.g. a list of samples
    in a project.
    """

    unique_registration = True

    def handle(self, multi_format_file):
        pass


class SubstancesSubmissionFileDemoHandler(Handler):
    """
    Executed when the user requests to create a demo file.
    """
    unique_registration = True

    demo_file = None  # The generated file

    demo_file_name = None  # The name of the file

    def handle(file_type):
        # TODO: file_type should be a string identifier that the user can define
        # in the plugin
        pass
