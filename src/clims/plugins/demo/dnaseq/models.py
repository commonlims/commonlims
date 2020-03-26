from __future__ import absolute_import
from clims.services import SubstanceBase, PlateBase
from clims.services.project import ProjectBase
from clims.services.extensible import FloatField, TextField


class ExampleSample(SubstanceBase):
    moxy = FloatField("moxy")
    cool = FloatField("cool")
    erudite = FloatField("erudite")
    sample_type = TextField("sample type")


class ExamplePlate(PlateBase):
    columns = 12
    rows = 8

    label_printer = TextField()


class ExampleProject(ProjectBase):
    pi = TextField("pi")
    project_code = TextField("project_code")
