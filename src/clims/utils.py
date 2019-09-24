from __future__ import absolute_import

import types


class UnexpectedLengthError(Exception):
    # Raised when there are more or less elements in a sequence
    pass


# http://stackoverflow.com/a/3013910/282024
def lazyprop(fn):
    attr_name = '_lazy_' + fn.__name__

    @property
    def _lazyprop(self):
        if not hasattr(self, attr_name):
            setattr(self, attr_name, fn(self))
        return getattr(self, attr_name)
    return _lazyprop


def single(seq):
    """
    Returns the first element in a list, throwing an exception if there is an
    unexpected number of items
    """
    if isinstance(seq, types.GeneratorType):
        seq = list(seq)
    if len(seq) != 1:
        raise UnexpectedLengthError(
            "Unexpected number of items in the list ({})".format(len(seq)))
    return seq[0]


def single_or_default(seq):
    """Returns the first element in a list or None if the list is empty, raising an exception if
    there are more than one elements in the list"""
    if len(seq) > 1:
        raise UnexpectedLengthError(
            "Expecting at most one item in the list. Got ({}).".format(len(seq)))
    elif len(seq) == 0:
        return None
    else:
        return seq[0]
