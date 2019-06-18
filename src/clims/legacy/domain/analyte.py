from __future__ import absolute_import
from clims.legacy.domain.aliquot import Aliquot
from clims.legacy import utils


class Analyte(Aliquot):
    """
    Describes an Analyte in the Legacy LIMS system.

    Expects certain mappings to UDFs in legacy. These are provided
    in udf_map, so they can be overridden in different installations.
    """

    def __init__(self, api_resource, is_input, id=None, samples=None, name=None, well=None,
                 is_control=False, udf_map=None, is_from_original=None):
        """
        Creates an analyte
        """
        super(self.__class__, self).__init__(api_resource, is_input=is_input, id=id,
                                             samples=samples, name=name, well=well,
                                             udf_map=udf_map)
        self.is_control = is_control
        self.is_output_from_previous = is_from_original

    def __repr__(self):
        typename = type(self).__name__
        if self.is_input is not None:
            typename = ("Input" if self.is_input else "Output") + typename
        return "{}<{} ({})>".format(typename, self.name, self.id)

    def sample(self):
        """
        Returns a single sample for convenience. Throws an error if there isn't exactly one sample.

        NOTE: There can be more than one sample on an Analyte. That's the case with pools.
        """
        return utils.single(self.samples)
