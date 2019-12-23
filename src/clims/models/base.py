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
        # TODO-nomerge: For efficiency it's probably wise to cache the results of wrapping

        # Subset can be either a single entry or a queryset, depending on if the key is a slice
        # or a single value.
        subset = self._queryset[key]

        if isinstance(subset, QuerySet):
            return [self._wrap_fn(entry) for entry in subset]
        return self._wrap_fn(subset)


# TODO: alternative approach that changes the behaviour of the django models themselves. I think
# that may be a worse approach: Rather just assume that callers get pure CLIMS objects (including
# our own iterators) which know how to interface with whatever ORM we're using underneath.
# This has the additional benefit of the django objects behaving 100% normally for cases where that
# is required.

# class WrappedModelIterable(ModelIterable):
#     """
#     A special implementation of Django's ModelIterable, that returns higher level CLIMS objects,
#     such as `SubstanceBase` instead of the basic Django models.
#     """
#     def __iter__(self):
#         obj = super(WrappedModelIterable, self).__iter__()

#         # TODO: Wrap here
#         yield obj


# class WrappedModelQuerySet(QuerySet):
#     def __init__(self, model=None, query=None, using=None, hints=None):
#         super(WrappedModelQuerySet, self).__init__(model, query, using, hints)
#         self._iterable_class = WrappedModelIterable


# class WrappedModelManager(models.Manager):
#     def get_queryset(self):
#         return WrappedModelQuerySet(self.model, using=self._db)
