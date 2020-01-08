from __future__ import absolute_import

import re
import six
from six import iteritems
from clims.services.extensible import ExtensibleBase
from clims.models import Container, ContainerVersion
from clims.services.wrapper import WrapperMixin
from clims.services.extensible_service_api import ExtensibleServiceAPIMixin


class IndexOutOfBounds(Exception):
    pass


class ContainerIndex(object):
    """
    Represent an index into a regular Container.
    """

    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

    @property
    def raw(self):
        # Returns the tuple that's used under the hood when saving the item.
        return self.x, self.y, self.z

    @classmethod
    def from_string(s):
        raise NotImplementedError("It's not possible to use this index type with a string")

    @classmethod
    def from_any_type(cls, key):
        # Creates an index for the input key if possible.
        if isinstance(key, six.binary_type):
            return cls.from_string(key)
        if isinstance(key, tuple):
            return cls(*key)
        else:
            raise NotImplementedError("Can't use {} as an index".format(type(key)))


class InvalidContainerIndex(Exception):
    pass


class PlateIndex(ContainerIndex):
    """
    Wraps an index to a plate from the generic zero based (x, y, z) coordinates used in the DB.

    Indexes into a plate are 0-based (row, column) tuples.

    They can also use the alternative <row-letter>[:]<column-number>, where row-letter is e.g. A for
    row 0 and column-number is a one-based column number. This allows users to address the top-left
    most location of the plate with 'A:1'
    """

    STRING_PATTERN = re.compile(r'(?P<row>\w):?(?P<col>\d+)')

    def __init__(self, row, column):
        super(PlateIndex, self).__init__(column, row, 0)

    @property
    def row(self):
        return self.y

    @property
    def column(self):
        return self.x

    @classmethod
    def from_string(cls, key):
        """
        Given a human-readable index into the container, e.g. "A:1", creates a new index.
        """
        m = cls.STRING_PATTERN.match(key)
        if not m:
            raise InvalidContainerIndex(
                "Can't interpret '{}' as a container location".format(key))
        row = m.group('row').upper()
        col = int(m.group('col')) - 1
        row_num = ord(row) - 65
        return cls(row_num, col)

    def __repr__(self):
        return "{}:{}".format(chr(self.row + 65), self.column + 1)


class ContainerBase(ExtensibleBase):
    """
    A base object for defining custom containers.

    Details:

    Under the hood, this object wraps a Container object and its related Extensible* classes.
    """

    WrappedArchetype = Container
    WrappedVersion = ContainerVersion
    IndexType = ContainerIndex

    # Override this in subclasses to a subclass-specific value
    # that specifies the ordering when traversing and appending
    traverse_by = None

    def __init__(self, **kwargs):
        super(ContainerBase, self).__init__(**kwargs)

        self._new_location = None
        self._has_ancestry = False
        self._locatables = dict()
        self._append_iterator = None

        if not self.is_dirty:
            # We are being updated with an instance from the DB, so we should map
            # all the items that are in it to this container
            # TODO: Make sure callers are prefetching!
            for location in self._wrapped_version.archetype.substance_locations.filter(current=True):
                self._locatables[location.raw] = self._app.substances.to_wrapper(location.substance)

    def append(self, value):
        """
        Appends to next free location in the container.

        Details:

        The traversal order can be overriden with the `_traverse` method.
        """
        if self._append_iterator is None:
            self._append_iterator = self._traverse(self.traverse_by)

        ix = next(self._append_iterator)
        self._locatables[ix.raw] = value

    def _traverse(self, order):
        """
        Returns an iterator for traversing the entire Container. The order is subclass specific.
        """
        raise NotImplementedError("Implement in a subclass")

    def _save_custom(self, creating):
        # Triggers a save for any substance that was added to this container.
        for position, locatable in self._locatables.items():
            locatable.move(self, position)
            if locatable.is_dirty:
                locatable.save()

    def _validate_boundaries(self, ix):
        raise NotImplementedError("Implement in a subclass")

    def __setitem__(self, key, value):
        ix = self.IndexType.from_any_type(key)
        self._validate_boundaries(ix)

        # Update the value. This will not actually move it in the backend until either
        # the container is saved
        self._locatables[ix.raw] = value

    @property
    def contents(self):
        c = []
        for loc_raw, substance in iteritems(self._locatables):
            c.append(substance)

        return c

    def __getitem__(self, key):
        ix = self.IndexType.from_any_type(key)
        self._validate_boundaries(ix)
        return self._locatables.get(ix.raw, None)

    def to_string(self, compressed=False, short=False):
        """
        Returns a detailed representation of the container. This is more detailed than
        __str__ provides.
        """


class PlateBase(ContainerBase):

    TRAVERSE_BY_ROW = 1
    TRAVERSE_BY_COLUMN = 2

    IndexType = PlateIndex

    traverse_by = TRAVERSE_BY_COLUMN
    rows = 1
    columns = 1

    def __init__(self, *args, **kwargs):
        super(PlateBase, self).__init__(**kwargs)

        if (self.columns is None or self.columns <= 0 or
                self.rows is None or self.rows <= 0):
            raise AssertionError("Plate rows and columns must be set to a value larger than zero")

    def _validate_boundaries(self, ix):
        if (not 0 <= ix.row < self.rows) or (not 0 <= ix.column < self.columns):
            raise IndexOutOfBounds("The index {} is out of bounds".format(ix))

    def _traverse(self, order=None):
        """
        Traverses the container, visiting wells in a certain order,
        yielding keys as (x, y, z) tuples, 0-indexed
        """
        if order is None:
            order = self.traverse_by
        rows = range(self.rows)
        cols = range(self.columns)

        if order == self.TRAVERSE_BY_ROW:
            return (PlateIndex(column=col, row=row) for row in rows for col in cols)
        elif order == self.TRAVERSE_BY_COLUMN:
            return (PlateIndex(column=col, row=row) for col in cols for row in rows)
        else:
            raise AssertionError("Unexpected order requested: {}".format(order))

    def to_string(self, format_fn=None, header=False):
        """
        Returns a detailed representation of the container. This is more detailed than
        __str__ provides.
        """
        def to_table():
            """Returns the wells in a list of lists"""
            table = list()
            for i in range(self.rows):
                row = list()
                for j in range(self.columns):
                    row.append(self[(i, j)])
                table.append(row)
            return table

        rows = list()

        if not format_fn:
            format_fn = lambda w: six.text_type(w.id) if w else " "
        table = to_table()
        longest = 0
        for row in table:
            rows.append(map(format_fn, row))
            longest = max(max(len(cell) for cell in rows[-1]), longest)
        for i in range(len(rows)):
            rows[i] = "|".join([cell.ljust(longest, " ") for cell in rows[i]])

        if header:
            rows.insert(0, self.name)
        return "\n".join(map(six.text_type, rows))


class ContainerService(WrapperMixin, ExtensibleServiceAPIMixin, object):
    _archetype_version_class = ContainerVersion
    _archetype_class = Container
    _archetype_base_class = ContainerBase

    def __init__(self, app):
        self._app = app

    def get_by_name(self, name):
        return self.get(name=name)

    def filter_from(self, query_builder):
        query_params = query_builder.parse_query()
        return self.filter(**query_params)


class ContainerQueryBuilder:
    def __init__(self, query_from_url):
        self.order_by = None
        self.query_from_url = query_from_url

    def order_by_created_date(self):
        self.order_by = '-archetype__created_at'

    def parse_query(self):
        query_params = dict()
        if self.order_by:
            query_params['order_by'] = self.order_by
        query = self.query_from_url.strip()
        if len(query) == 0:
            return query_params
        query = query.split(" ")

        if len(query) > 1:
            raise NotImplementedError("Complex queries are not yet supported")

        query = query[0]
        key, val = query.split(":")

        if key == "container.name":
            query_params['name__icontains'] = val
        else:
            raise NotImplementedError("The key {} is not implemented".format(key))
        return query_params

