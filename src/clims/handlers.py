from __future__ import absolute_import

import inspect
import abc
import six
import logging
import importlib
import pkgutil
import yaml
from clims import utils
from clims.plugins import PluginValidationError


logger = logging.getLogger(__name__)


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

    def __init__(self, organization=None):
        self.organization = organization


class HandlerManager(object):
    """
    Manages plugin defined handlers.
    """

    def __init__(self):
        # Initialize the handlers dictionary with the types of baseclasses we can find:
        self.handlers = self.find_handler_baseclasses()
        logger.debug("Handler dictionary initialized: '{}'".format(self.handlers.keys()))

    def add_handler_implementation(self, handler_type, implementation):
        self.handlers[handler_type].add(implementation)

    def remove_implementations(self):
        for key in self.handlers:
            self.handlers[key] = set()

    def find_handler_baseclasses(self):
        """
        Finds all baseclasses of `clims.handlers.Handler`.
        """
        handlers = dict()
        handler_subclasses = Handler.__subclasses__()
        for subclass in handler_subclasses:
            logger.info("Found handler type {}".format(subclass))
            handlers[subclass] = set()
        return handlers

    def handler_count(self, cls):
        return len(self.handlers[cls])

    def require_single_handler(self, cls):
        handlers = self.handlers[cls]
        count = len(handlers)
        if count == 0:
            raise RequiredHandlerNotFound("No handler that implements '{}' found".format(cls))
        elif count > 1:
            raise RequiredHandlerNotFound("Too many registered handlers found for '{}'".format(cls))

    def require_handler(self, cls):
        handlers = self.handlers[cls]
        count = len(handlers)
        if count == 0:
            raise RequiredHandlerNotFound("No handler that implements '{}' found".format(cls))

    def handle(self, cls, context, required, *args, **kwargs):
        """
        Runs all handlers registered for cls in sequence. *args are sent to the handler as arguments.

        Returns a list of the handlers that were executed
        """
        logger.info("Handling action {}".format(cls))

        ret = list()
        if required:
            self.require_handler(cls)
        handlers = self.handlers[cls]
        logger.debug("Handlers found for '{}': '{}'".format(cls, handlers))

        for handler in handlers:
            # TODO: the plugins manager should have an instance of the app

            from clims.services import ioc
            instance = handler(context, ioc.app)
            ret.append(instance)
            logger.debug("Executing handle on '{}'".format(instance))
            instance.handle(*args, **kwargs)
        return ret

    def load_handlers(self, mod):
        """
        Loads all handlers found in this module or submodules. This only searches for
        implementations, but semantics about what may be used are applied after all handlers
        have been loaded for the application and should be taken care of by the caller of this
        method
        """

        def is_candidate(member, handler_type):
            # Returns True if the class is a valid implementation of the handler_type
            return (inspect.isclass(member) and
                    (not inspect.isabstract(member)) and
                    issubclass(member, handler_type) and
                    member != handler_type)

        def find_implementations_in(mod_name, handler_type):
            mod = importlib.import_module(mod_name)
            clsmembers = inspect.getmembers(mod, lambda member: is_candidate(member, handler_type))
            clsmembers = set([member for name, member in clsmembers])
            logger.debug("Subclasses of '{}' in '{}': {}".format(handler_type, mod_name, clsmembers))
            return clsmembers

        def find_all_implementations(handler_type):
            # Finds all implementations of `handler_type` in `mod` or any submodule of `mod`
            ret = set()
            ret.update(find_implementations_in(mod.__name__, handler_type))
            for _, mod_name, _ in pkgutil.iter_modules(path=mod.__path__, prefix=mod.__name__ + "."):
                ret.update(find_implementations_in(mod_name, handler_type))
            return ret

        for handler_type in self.handlers.keys():
            logger.debug("Searching for implementations of {}".format(handler_type))
            self.handlers[handler_type].update(find_all_implementations(handler_type))

    def to_handler_config(self):
        """
        Returns a YML view of the state of handlers
        """
        return yaml.dump(
            {utils.class_full_name(handler): [utils.class_full_name(c)
                for c in impls] for handler, impls in self.handlers.items()},
            default_flow_style=False
        )

    def validate(self):
        """
        Should be called after all handlers that will be used have been loaded.
        """

        logger.info("Validating 'unique' role for handlers")

        for handler_type, impls in self.handlers.items():
            if handler_type.unique_registration and len(impls) > 1:
                raise MultipleHandlersNotAllowed("Handler type '{}' requires there to be only "
                        "one implementation but found: '{}'".format(handler_type, impls))

        """
        TODO: Add the rule that only leaf handlers can be used. So if we have the following
        structure, as an example:
            PluginA:
                ImplOfX(X)
                ImplOfY(Y)
            PluginB:
                ImplOfY2(ImplOfY)

        ImplOfY2 from PluginB should be used but not ImplOfY from PluginA.

        This would probably be more expected than if both handlers would be used, but
        could also lead to unexpected situations, so it's still being discussed by the team.
        """


@six.add_metaclass(abc.ABCMeta)
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


@six.add_metaclass(abc.ABCMeta)
class SubstancesValidationHandler(Handler):
    """
    Executed when a user submits a batch of substances, e.g. a list of samples
    in a project.
    """

    unique_registration = True

    def handle(self, multi_format_file):
        pass


@six.add_metaclass(abc.ABCMeta)
class SubstancesSubmissionHandler(Handler):
    """
    Executed when a user submits a batch of substances, e.g. a list of samples
    in a project.
    """

    unique_registration = True

    def handle(self, multi_format_file):
        pass


@six.add_metaclass(abc.ABCMeta)
class SubstancesSubmissionFileDemoHandler(Handler):
    """
    Executed when the user requests to create a demo file.
    """
    unique_registration = True

    demo_file = None  # The generated file

    demo_file_name = None  # The name of the file

    def handle(self, file_type):
        # TODO: file_type should be a string identifier that the user can define
        # in the plugin
        pass
