from __future__ import absolute_import, print_function
import six
from collections import namedtuple
from six.moves import map


class Csv:
    """A simple wrapper for csv files"""

    def __init__(self, file_stream=None, delim=",", file_name=None, newline="\n", header=None):
        self.header = list()
        self.data = list()
        # "if file_stream" is not working for some reason with the file stream given here,
        # always returns False. "if file_stream is not None" works.
        if file_stream is not None:
            if isinstance(file_stream, six.string_types):
                with open(file_stream, "r") as fs:
                    self._init_from_file_stream(fs, delim, None)
            else:
                self._init_from_file_stream(file_stream, delim, header)
        self.file_name = file_name
        self.delim = delim
        self.newline = newline

    def _init_from_file_stream(self, file_stream, delim, header):
        if header is not None:
            self.set_header(header)

        for ix, line in enumerate(file_stream):
            values = line.strip().split(delim)
            if ix == 0 and header is None:
                self.set_header(values)
            else:
                self.append(values)

    def set_header(self, header):
        self.key_to_index = {key: ix for ix, key in enumerate(header)}
        self.header = header

    def append(self, values, tag=None):
        """Appends a data line to the CSV, values is a list"""
        csv_line = CsvLine(values, self.key_to_index, tag)
        self.data.append(csv_line)

    def __iter__(self):
        return iter(self.data)

    def to_string(self, include_header=True):
        ret = []
        if include_header:
            ret.append(self.delim.join(map(six.text_type, self.header)))
        for line in self.data:
            ret.append(self.delim.join(map(six.text_type, line)))
        return self.newline.join(ret)

    def __repr__(self):
        return "<Csv {}>".format(self.file_name)


class CsvLine:
    """
    Represents one line in a CSV file, items can be added or removed
    like this were a dictionary
    """

    def __init__(self, line, key_to_index, tag=None):
        self.line = line
        self.tag = tag
        self.key_to_index = key_to_index

    def __getitem__(self, key):
        index = self.key_to_index[key]
        return self.line[index]

    def __setitem__(self, key, value):
        index = self.key_to_index[key]
        self.line[index] = value

    def __iter__(self):
        return iter(self.values)

    def get_bundled_values(self, exclude_columns=None):
        """
        Group values from this line with column names and indices
        :param exclude_columns: A list of column names to be excluded
        :return: A list of tuples containing value, column name and column index
        """
        excluded_indices = list()
        if exclude_columns:
            excluded_indices = [self.index_for(col) for col in exclude_columns]

        bundled_values = list()
        for idx, value in enumerate(self.line):
            if idx not in excluded_indices:
                column_name = self.get_column_name_for(idx)
                bundle = BundledValue(value=value, column_name=column_name, column_index=idx)
                bundled_values.append(bundle)

        return bundled_values

    def index_for(self, key):
        return self.key_to_index[key]

    def get_column_name_for(self, idx):
        for key in self.key_to_index:
            if self.key_to_index[key] == idx:
                return key

        return None

    @property
    def values(self):
        return self.line

    def __repr__(self):
        return repr(self.values)


class BundledValue(namedtuple('BundledValue', ['value', 'column_name', 'column_index'])):
    pass
