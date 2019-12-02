from __future__ import absolute_import
from clims.services import SubstanceBase, TextField, IntField, FloatField, JsonField, BoolField
from clims.services import PlateBase


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
