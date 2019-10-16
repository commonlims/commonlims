from __future__ import absolute_import

from clims.services.extensible import ExtensibleService
from clims.services.substance import SubstanceService
from clims.services.container import ContainerService


class ApplicationService(object):
    """
    Sets up instances of all required `Service` object in the system.
    """

    def __init__(self):
        self.extensibles = ExtensibleService(self)
        self.substances = SubstanceService(self)
        self.containers = ContainerService(self)


class InversionOfControl(object):
    def __init__(self):
        self._app = None

    def set_application(self, app):
        self._app = app

    @property
    def app(self):
        if self._app is None:
            self._app = ApplicationService()
        return self._app


ioc = InversionOfControl()
