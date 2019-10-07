"""
sentry.plugins.base.manager
~~~~~~~~~~~~~~~~~~~~~~~~~~~

:copyright: (c) 2010-2013 by the Sentry Team, see AUTHORS for more details.
:license: BSD, see LICENSE for more details.
"""
from __future__ import absolute_import, print_function

__all__ = ('PluginManager', )

import os
import six
import logging
import inspect

from sentry.utils.managers import InstanceManager
from sentry.utils.safe import safe_execute
from clims.workflow import WorkflowEngine, WorkflowEngineException

logger = logging.getLogger('clims.plugins')


class PluginManager(InstanceManager):
    def __init__(self, class_list=None, instances=True):
        super(PluginManager, self).__init__(class_list, instances)
        self.work_batches = list()
        self.handlers_mapped_by_work_batch_type = dict()  # TODO: clean up names!

        self.handlers = dict()
        self.register_handler_baseclasses()

    def __iter__(self):
        return iter(self.all())

    def __len__(self):
        return sum(1 for i in self.all())

    def register_handler_baseclasses(self):
        from clims import handlers

        for _name, cls in inspect.getmembers(handlers, inspect.isclass):
            if cls != handlers.Handler and issubclass(cls, handlers.Handler):
                self.handlers[cls] = set()

    def auto_register(self):
        """Registers all plugins that can be found in the Python environment"""

        # TODO: The plugin mechanism is rather unclean at the moment. CLIMS introduced
        # PluginRegistration which is required so that we can see which plugin+version made which
        # change. Sentry's plugins are more liberal and don't require that.
        # Because of this, we want plugins to be registered only during `lims upgrade` (or
        # be configured) so that users don't accidentally make changes by just pip installing
        # some package.
        # So the workflow should be:
        #   * regular startup: Make plugins available only if there exists a PluginRegistration
        #   * upgrade: Add a PluginRegistration object (register a plugin) if it has been pip
        #              installed
        # TODO: Newer versions should take precedence over older.
        for plugin in self.all(2):
            # TODO: Do this in a transaction
            self.register_model(plugin)
            self.register_plugin_workflow(plugin)
            self.register_extensible_types(plugin)

    def register_plugin_workflow(self, plugin):
        definitions = list(plugin.workflow_definitions())
        workflows = WorkflowEngine()
        # TODO: Validate that each workflow has a valid name, corresponding with
        # the name of the plugin
        if definitions:
            for definition in definitions:
                file_name = os.path.basename(definition)
                try:
                    workflows.deploy(definition)
                    logger.info(
                        "Uploaded workflow definition {} for plugin {}".format(
                            file_name, plugin))
                except WorkflowEngineException as e:
                    # TODO: Disable the plugin in this case (if not in dev mode)
                    logger.error(
                        "Can't upload workflow definition {} for plugin {}".format(
                            file_name, plugin))
                    logger.error(e)

    def register_model(self, plugin):
        """
        Registers the plugin in the database.

        This method should be called when upgrading the system, so the end-user is in control
        of when a new model is available.
        """
        # Make sure we have a plugin registration here:
        from clims.models import PluginRegistration
        from sentry.models import Organization
        try:
            plugin_version = plugin.version
        except AttributeError:
            plugin_version = "NA"

        # NOTE: Registration currently happens for all organizations. We can limit that
        # further in a future release.
        for org in Organization.objects.all():
            PluginRegistration.objects.get_or_create(
                name=plugin.full_name, version=plugin_version, organization=org)

    def register_extensible_types(self, plugin):
        """
        Registers extensible types in the plugin if any are found
        """
        from clims.services import ExtensibleBase, SubstanceBase
        from clims.models import PluginRegistration
        from clims.services import ApplicationService
        app = ApplicationService()

        # TODO: Mark ExtensibleBase and SubstanceBase so that they are not registered, so the
        # knowledge of which bases are not to be registered is elsewhere
        known_bases = [ExtensibleBase, SubstanceBase]

        mod = self.get_plugin_module(plugin, 'models')
        if not mod:
            return

        plugin_model = PluginRegistration.objects.get(name=plugin.full_name)
        for _name, class_to_register in inspect.getmembers(mod, inspect.isclass):
            if issubclass(class_to_register, ExtensibleBase) and \
                    class_to_register not in known_bases:
                app.extensibles.register(plugin_model, class_to_register)

    def all(self, version=1):
        """
        Returns all enabled plugins with the specified interface version.

        :param version: The version of the plugin interface. None will return all enabled plugins.
        :return: A generator that iterates over the plugins
        """
        for plugin in sorted(super(PluginManager, self).all(), key=lambda x: x.get_title()):
            if not plugin.is_enabled():
                continue
            if version is not None and plugin.__version__ != version:
                continue
            yield plugin

    def _register_work_batches(self, class_path):
        pass

    def all_work_batches(self):
        return self.work_batches

    def add(self, class_path):
        super(PluginManager, self).add(class_path)

        self._register_work_batches(class_path)

    def configurable_for_project(self, project, version=1):
        for plugin in self.all(version=version):
            if not safe_execute(plugin.can_configure_for_project,
                                project, _with_transaction=False):
                continue
            yield plugin

    def exists(self, slug):
        for plugin in self.all(version=None):
            if plugin.slug == slug:
                return True
        return False

    def for_project(self, project, version=1):
        for plugin in self.all(version=version):
            if not safe_execute(plugin.is_enabled, project, _with_transaction=False):
                continue
            yield plugin

    def for_site(self, version=1):
        for plugin in self.all(version=version):
            if not plugin.has_site_conf():
                continue
            yield plugin

    def get(self, slug):
        for plugin in self.all(version=None):
            if plugin.slug == slug:
                return plugin
        raise KeyError(slug)

    def first(self, func_name, *args, **kwargs):
        version = kwargs.pop('version', 1)
        for plugin in self.all(version=version):
            try:
                result = getattr(plugin, func_name)(*args, **kwargs)
            except Exception as e:
                logger = logging.getLogger('sentry.plugins.%s' % (type(plugin).slug, ))
                logger.error(
                    '%s.process_error',
                    func_name,
                    exc_info=True,
                    extra={'exception': e},
                )
                continue

            if result is not None:
                return result

    # TODO: This should be called e.g. load, as it's just the in-process loading. The registration
    # is when we register in the database
    def register(self, cls):
        self.add('%s.%s' % (cls.__module__, cls.__name__))
        self.load_handlers(cls)
        return cls

    def get_registered_base_handler(self, cls):
        """
        Returns True if cls is an implementation of a registered handler type
        """
        for handler_type in self.handlers:
            if issubclass(cls, handler_type):
                return handler_type
        return None

    def get_plugin_module(self, plugin_class, name):
        """
        Gets a module defined in the plugin. Returns None if it wasn't found
        """
        import importlib
        module_name = "{}.{}".format(plugin_class.__module__, name)

        try:
            return importlib.import_module(module_name)
        except ImportError as ex:
            if six.text_type(ex) != "No module named {}".format(name):
                raise ex

    def load_handlers(self, cls):

        # Registers handlers. Handlers must be in a module directly below
        # the plugin's module:

        mod = self.get_plugin_module(cls, 'handlers')
        if not mod:
            return

        for _name, impl in inspect.getmembers(mod, inspect.isclass):
            baseclass = self.get_registered_base_handler(impl)
            if baseclass and baseclass != impl:
                # We've found an implementation of the baseclass. Before adding however, we'll
                # need to make sure that if we already have a less concrete implementation in
                # the set we should use the more concrete one:

                if baseclass.unique_registration and len(self.handlers[baseclass]) > 1:
                    # Invariant: There must be only one instance of this baseclass if we're here
                    assert len(self.handlers[baseclass]) == 1

                    impl_already_reg = self.handlers[baseclass]
                    if issubclass(impl, impl_already_reg):
                        # Current class is more concrete, let's replace it:
                        self.handlers[baseclass].clear()
                        self.handlers[baseclass].add(impl)
                    elif issubclass(impl_already_reg, impl):
                        # The implementation we've already registered is more concrete
                        pass
                    else:
                        # We got two registrations of the same implementation
                        # TODO: In this case the user should be able to add a config variable
                        # to select the implementation to use
                        from clims.handlers import MultipleHandlersNotAllowed
                        raise MultipleHandlersNotAllowed(
                            "Trying to register the handler '{}' as the unique implementation "
                            "of '{}' but already have '{}' registered".format(
                                impl, baseclass, impl_already_reg))
                else:
                    self.handlers[baseclass].add(impl)

    def unregister(self, cls):
        self.remove('%s.%s' % (cls.__module__, cls.__name__))
        return cls


class WorkBatchRegistrationException(Exception):
    pass
