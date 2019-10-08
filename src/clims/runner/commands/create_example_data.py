
from __future__ import absolute_import, print_function
import random

import click
from sentry.runner.decorators import configuration


@click.command()
@configuration
def createexampledata():
    """
    Create example data for clims
    """
    from clims.services.application import ioc, ApplicationService
    from clims.services.substance import SubstanceBase, FloatField
    from clims.models.plugin_registration import PluginRegistration
    from sentry.models.organization import Organization

    app = ApplicationService()
    ioc.set_application(app)

    org = Organization.objects.get(name="lab")

    example_plugin, _ = PluginRegistration.objects.get_or_create(
        name='clims.example.plugin', version='1.0.0', organization=org)

    class ExampleSample(SubstanceBase):
        moxy = FloatField("moxy")
        cool = FloatField("cool")
        erudite = FloatField("erudite")

    app.extensibles.register(example_plugin, ExampleSample)

    for _ in range(100):
        name = "sample-{}".format(random.randint(1, 1000000))
        sample = ExampleSample(name=name,
                               organization=org,
                               moxy=random.randint(1, 100),
                               cool=random.randint(1, 100),
                               erudite=random.randint(1, 100))
        sample.save()
        click.echo("Created sample: {}".format(sample.name))
