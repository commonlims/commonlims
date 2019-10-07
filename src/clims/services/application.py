from __future__ import absolute_import

from clims.services.extensible import ExtensibleService
from clims.services.substance import SubstanceService


class ApplicationService(object):
    """
    Sets up instances of all required `Service` object in the system.
    """

    def __init__(self):
        self.extensibles = ExtensibleService(self)
        self.substances = SubstanceService(self)
