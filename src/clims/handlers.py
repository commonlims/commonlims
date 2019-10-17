from __future__ import absolute_import


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


class SubstancesSubmissionHandler(Handler):
    """
    Executed when a user submits a batch of substances, e.g. a list of samples
    in a project.
    """

    unique_registration = True

    def handle(file_obj):
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
