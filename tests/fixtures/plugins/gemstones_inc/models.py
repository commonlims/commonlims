from __future__ import absolute_import
from clims.services import (SubstanceBase, ProjectBase, TextField, IntField, JsonField, BoolField)
from clims.services import PlateBase


class GemstoneProject(ProjectBase):
    continent = TextField(prop_name="continent")


class GemstoneSample(SubstanceBase):
    preciousness = TextField()
    color = TextField()
    index = IntField()
    weight = IntField()
    payload = JsonField()
    has_something = BoolField()


class GemstoneContainer(PlateBase):
    rows = 8
    columns = 12

    comment = TextField()
    color = TextField()
