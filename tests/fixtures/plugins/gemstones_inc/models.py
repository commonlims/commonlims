from __future__ import absolute_import
from clims.services import SubstanceBase, ProjectBase, TextField, IntField, FloatField, JsonField, BoolField
from clims.services import PlateBase


class GemstoneProject(ProjectBase):
    continent = TextField(prop_name="continent")


class GemstoneSample(SubstanceBase):
    preciousness = TextField(prop_name="preciousness")  # TODO: Metaclass that sets prop_name
    color = TextField(prop_name="color")
    index = IntField(prop_name="index")
    weight = IntField(prop_name="weight")
    payload = JsonField(prop_name="payload")
    has_something = BoolField(prop_name="has_something")


class GemstoneContainer(PlateBase):
    rows = 8
    columns = 12

    comment = TextField("comment")
