"""
sentry.plugins.base.manager
~~~~~~~~~~~~~~~~~~~~~~~~~~~

:copyright: (c) 2010-2013 by the Sentry Team, see AUTHORS for more details.
:license: BSD, see LICENSE for more details.
"""
from __future__ import absolute_import, print_function

__all__ = ('PluginManager', )

import logging

from sentry.utils.managers import InstanceManager
from sentry.utils.safe import safe_execute


class PluginManager(InstanceManager):
    def __init__(self, class_list=None, instances=True):
        super(PluginManager, self).__init__(class_list, instances)
        self.work_batches = list()
        self.handlers_mapped_by_work_batch_type = dict()  # TODO: clean up names!

    def __iter__(self):
        return iter(self.all())

    def __len__(self):
        return sum(1 for i in self.all())

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
        # If the plugin has a `handlers` module. Import that so that it will register everything
        self.add('%s.%s' % (cls.__module__, cls.__name__))
        return cls

    def unregister(self, cls):
        self.remove('%s.%s' % (cls.__module__, cls.__name__))
        return cls


class WorkBatchRegistrationException(Exception):
    pass
