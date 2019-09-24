from __future__ import absolute_import, print_function
import six


class Csv:
    """A simple wrapper for csv files"""

    def __init__(self, file_stream=None, delim=",", file_name=None, newline="\n", header=None):
        self.header = list()
        self.data = list()
        if file_stream:
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
        csv_line = CsvLine(values, self, tag)
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

    def __init__(self, line, csv, tag=None):
        self.line = line
        self.csv = csv
        self.tag = tag

    def __getitem__(self, key):
        index = self.csv.key_to_index[key]
        return self.line[index]

    def __setitem__(self, key, value):
        index = self.csv.key_to_index[key]
        self.line[index] = value

    def __iter__(self):
        return iter(self.values)

    @property
    def values(self):
        return self.line

    def __repr__(self):
        return repr(self.values)
