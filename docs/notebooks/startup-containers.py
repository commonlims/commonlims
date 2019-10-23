from startup import *

# Define requirements from the previous notebook that we don't want to repeat


class WoodSample(SubstanceBase):
    flammability = FloatField("flammability")
    weight = FloatField("weight")
    width = FloatField("width")
    comment = TextField("comment")


app.extensibles.register(notebook_plugin, WoodSample)
