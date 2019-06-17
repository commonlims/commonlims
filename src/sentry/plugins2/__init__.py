from __future__ import absolute_import
# TODO: Refactor
# This module should actually be merged with the plugin
# module. However, it imports a ton of django stuff which leads to
# an error with apps not being registered yet. So for the POC we'll keep the decorators here


class Container(object):
    pass


# TODO: Use the Django model directly? If so, figure out how to automatically setup django
# for testing purposes from a plugin
# class Sample(object):
#     def __init__(self, sample_name, sample_type, concentration, volume, custom_fields):
#         self.sample_name = sample_name
#         self.sample_type = sample_type
#         self.concentration = concentration
#         self.volume = volume
#         self.custom_fields = custom_fields

#     def __repr__(self):
#         return self.sample_name

class SampleService():
    def __init__(self, namespace):
        self.containers = list()
        self.samples = list()
        self.namespace = namespace

    def add(self, sample):
        raise NotImplementedError()

    def new_sample(self, sample_name, sample_type, concentration, volume, **kwargs):
        """Creates a Sample object with the specified default parameters and any domain specific
        parameters in kwargs. The domain specific arguments will be registered per the calling plugin,
        which will automatically add a namespace to the keys
        """
        raise NotImplementedError()


class App(object):
    """An interface for plugins that need to communicate back to the app"""

    def __init__(self, namespace):
        self.samples = SampleService(namespace)


class FileHandlersRegistry(object):
    def __init__(self):
        self.handlers = set()

    def register(self, fn):
        self.handlers.add(fn)

    def handle_file_uploaded(self, file_like):
        raise NotImplementedError()

        for handler in self.handlers:
            if type(handler) == type:
                obj = handler()
                if not hasattr(obj, "handle"):
                    raise HandlerNotDefinedException(
                        "A handler must contain a method called `handle`")
                handler = obj.handle
            handler(file_like, App(handler.__module__))


# TODO: Look into if we can reuse something from sentry instead
file_handlers_registry = FileHandlersRegistry()


class HandlerNotDefinedException(Exception):
    pass
