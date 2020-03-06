"""
sentry.plugins.base
~~~~~~~~~~~~~~~~~~~

:copyright: (c) 2010-2013 by the Sentry Team, see AUTHORS for more details.
:license: BSD, see LICENSE for more details.
"""


from .bindings import BindingManager
from .manager import (PluginManager,  # noqa
        PluginMustHaveVersion, PluginIncorrectVersionFormat, RequiredPluginCannotLoad)  # noqa
from sentry.utils.managers import InstanceManager
from .notifier import *  # NOQA
from .response import *  # NOQA
from .structs import *  # NOQA
from .v1 import *  # NOQA
from .v2 import *  # NOQA

bindings = BindingManager()

plugins = PluginManager(InstanceManager())
