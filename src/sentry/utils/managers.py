"""
Original copyright:

:copyright: (c) 2010-2014 by the Sentry Team, see AUTHORS for more details.
:license: BSD, see LICENSE for more details.
"""

from __future__ import absolute_import
import sys
import six
import logging

logger = logging.getLogger(__name__)


class LoadException(Exception):
    pass


class ImportException(LoadException):
    pass


class InitializeException(LoadException):
    pass


LAZY_MARKER = object()


class InstanceManager(object):

    ImportException = ImportException

    InitializeException = InitializeException

    def __init__(self):
        self.instances = dict()

    def get_class_list(self):
        return list(self.cache.keys())

    def add(self, class_path, required_version=None, must_load=False):
        """
        Adds the class_path to the list of instances. The instance
        is not loaded directly unless either version is set or must_load is True
        """
        if must_load or required_version:
            self.instances[class_path] = self._fetch(class_path, required_version, must_load)
        else:
            self.instances[class_path] = LAZY_MARKER
        return self.instances[class_path]

    def remove(self, class_path):
        del self.instances[class_path]

    def _fetch(self, class_path, required_version=None, must_load=False):
        """
        Fetches the entry, loading it if it's marked as lazy.

        The entry may be None, indicating that it was not found and that it wasn't required to load
        (see `add`).
        """
        try:
            ret = self._load(class_path)
        except LoadException as ex:
            if must_load:
                six.reraise(*sys.exc_info())
            else:
                logger.warn(ex.msg)
                ret = None

        if ret and required_version and ret.version != required_version:
            raise AssertionError("Found '{}' but it's not of the correct version {} != {}".format(
                class_path, required_version, ret.version))

        return ret

    def _load(self, class_path):
        """
        Loads and initializes the instance.

        Raises ImportError if the instance can't be imported and LoadException if it can't
        be initialized.
        """
        module_name, class_name = class_path.rsplit('.', 1)

        def reraise_as_import_error():
            # Reraises the current ex as an ImportError, adding context about the class_path to
            # the message
            _, ex, tb = sys.exc_info()
            ex = "Can't import {}: {}".format(class_path, ex)
            six.reraise(ImportException, ex, tb)

        try:
            module = __import__(six.binary_type(module_name), {}, {}, six.binary_type(class_name))
        except ImportError:
            reraise_as_import_error()

        try:
            cls = getattr(module, class_name)
        except AttributeError:
            reraise_as_import_error()

        try:
            return cls()
        except Exception:
            # Reraise so we get the traceback from the original exception
            six.reraise(InitializeException, "Not able to initialize class '{}'".format(class_path))

    def all(self):
        """
        Returns all instances. This forces a load of all lazy objects.
        """

        # TODO: Just have the class implement the iter protocol instead.

        for cls_path, value in self.instances.items():
            if value == LAZY_MARKER:
                # Instances that are lazy loaded do not require version checks and can fail
                # while loading
                instance = self._fetch(cls_path)
                self.instances[cls_path] = instance
                yield instance
            else:
                yield value
