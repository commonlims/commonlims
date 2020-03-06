from __future__ import absolute_import
from clims.services.substance import SubstanceBase
from clims.services.project import ProjectBase
from clims.services.extensible import FloatField, TextField
from clims.services.container import PlateBase


class ExampleSample(SubstanceBase):
    moxy = FloatField("moxy")
    cool = FloatField("cool")
    erudite = FloatField("erudite")
    sample_type = TextField("sample type")


class ExampleProject(ProjectBase):
    pi = TextField("pi")
    project_code = TextField("project_code")


class PandorasBox(PlateBase):
    rows = 3
    columns = 3
