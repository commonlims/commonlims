from __future__ import absolute_import
from django.db.models.manager import QuerySet


class ResultIterator(object):
    """
    An iterator returned from services, e.g. `SubstanceService.all`

    This class behaves in some ways similar to the Django QuerySet (wraps it), which is used
    internally, but with functionality limited to iterating over the results. This hides the
    implementation details of the relation between models.
    """

    def __init__(self, qs, wrap_fn):
        self._queryset = qs
        self._wrap_fn = wrap_fn

    def __iter__(self):
        for entry in self._queryset:
            yield self._wrap_fn(entry)

    def __len__(self):
        return len(self._queryset)

    def __getitem__(self, key):
        # TODO: For efficiency it's probably wise to cache the results of wrapping

        # Subset can be either a single entry or a queryset, depending on if the key is a slice
        # or a single value.
        subset = self._queryset[key]

        if isinstance(subset, QuerySet):
            return [self._wrap_fn(entry) for entry in subset]
        return self._wrap_fn(subset)
