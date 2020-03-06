

from .provider import *  # NOQA
from .manager import ProviderManager
from .view import *  # NOQA

manager = ProviderManager()
register = manager.register
unregister = manager.unregister
