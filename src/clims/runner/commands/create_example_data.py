
from __future__ import absolute_import, print_function
import random
from uuid import uuid4


import click
from sentry.runner.decorators import configuration


@click.command()
@configuration
def createexampledata():
    """
    Create example data for clims
    """
    from clims.services.application import ioc, ApplicationService
    from clims.services.substance import SubstanceBase
    from clims.services.project import ProjectBase
    from clims.services.extensible import FloatField, TextField
    from clims.models.plugin_registration import PluginRegistration
    from sentry.models.organization import Organization
    from clims.models import WorkBatch

    app = ApplicationService()
    ioc.set_application(app)

    org = Organization.objects.get(name="lab")

    example_plugin, _ = PluginRegistration.objects.get_or_create(
        name='clims.example.plugin', version='1.0.0', organization=org)

    for name in ["Select second QC method", "Quant-IT", "Qubit 3", "Tapestation"]:
        wb = WorkBatch(name=name, organization=org, plugin=example_plugin)
        wb.save()

    class ExampleSample(SubstanceBase):
        moxy = FloatField("moxy")
        cool = FloatField("cool")
        erudite = FloatField("erudite")

    class ExampleProject(ProjectBase):
        pi = TextField("pi")
        project_code = TextField("project_code")

    app.extensibles.register(example_plugin, ExampleSample)
    app.extensibles.register(example_plugin, ExampleProject)

    for _ in range(100):
        name = "sample-{}".format(random.randint(1, 1000000))
        sample = ExampleSample(name=name,
                               organization=org,
                               moxy=random.randint(1, 100),
                               cool=random.randint(1, 100),
                               erudite=random.randint(1, 100))
        sample.save()
        click.echo("Created sample: {}".format(sample.name))

    pis = ["Rosaline Franklin", "Charles Darwin", "Gregor Medel"]
    for _ in range(100):
        name = "demo-{}".format(uuid4().hex)
        project = ExampleProject(name=name, organization=org, project_code=name, pi=random.choice(pis))
        project.save()
        click.echo("Created sample: {}".format(project.name))
