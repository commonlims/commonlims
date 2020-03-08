from __future__ import absolute_import


class HamiltonReader(object):

    def __init__(self, filecontents):
        self._delimiter = "\t"
        rows = [rw for rw in filecontents.split("\n") if len(rw) > 0]
        self.matrix = [row.split(self._delimiter) for row in rows]
        entries = [(rw[0], rw) for rw in self.matrix]
        self.dict_matrix = dict(entries)

    def number_columns(self):
        return len(self.matrix[0])

    def number_rows(self):
        return len(self.matrix)


class HamiltonColumnReference(object):

    def __init__(self):
        self.sample = 0
        self.source_well_pos = 1
        self.source_plate_pos = 2
        self.volume_sample = 3
        self.volume_buffer = 4
        self.target_well_pos = 5
        self.target_plate_pos = 6
