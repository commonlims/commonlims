"""
sentry.plugins.base.manager
~~~~~~~~~~~~~~~~~~~~~~~~~~~

:copyright: (c) 2010-2013 by the Sentry Team, see AUTHORS for more details.
:license: BSD, see LICENSE for more details.
"""
from __future__ import absolute_import, print_function

__all__ = ('PluginManager', )

import six
import logging
import inspect

from sentry.utils.managers import InstanceManager
from sentry.utils.safe import safe_execute


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

        # import pkgutil
        # for mod in pkgutil.walk_packages():
        #    print(mod)

        # Walk the plugin and check if it implements WorkBatchSettings

        # def import_submodules(context, root_module, path):
        # for loader, module_name, is_pkg in pkgutil.walk_packages(path, root_module + '.'):
        #     # this causes a Runtime error with model conflicts
        #     # module = loader.find_module(module_name).load_module(module_name)
        #     module = __import__(module_name, globals(), locals(), ['__name__'])
        #     for k, v in six.iteritems(vars(module)):
        #         if not k.startswith('_'):
        #             context[k] = v
        # context[module_name] = module
        # > import_submodules(globals(), __name__, __path__)

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

    def register(self, cls):
        self.add('%s.%s' % (cls.__module__, cls.__name__))
        self.register_handlers(cls)
        return cls

    def get_registered_base_handler(self, cls):
        """
        Returns True if cls is an implementation of a registered handler type
        """
        for handler_type in self.handlers:
            if issubclass(cls, handler_type):
                return handler_type
        return None

    def register_handlers(self, cls):
        import inspect
        import importlib

        # Registers handlers. Handlers must be in a module directly  below
        # the plugin's module:
        handlers_module = "{}.handlers".format(cls.__module__)
        mod = importlib.import_module(cls.__module__)

        try:
            mod = importlib.import_module(handlers_module)
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

        except ImportError as ex:
            # TODO: Would prefer not to use the error message to check for the
            # exact type of error being thrown
            if six.text_type(ex) != "No module named handlers":
                raise ex

    def unregister(self, cls):
        self.remove('%s.%s' % (cls.__module__, cls.__name__))
        return cls


class WorkBatchRegistrationException(Exception):
    pass
