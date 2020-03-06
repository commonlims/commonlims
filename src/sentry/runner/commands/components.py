

import click
from sentry.runner.decorators import configuration


@click.command('add-component')
@click.argument('name')
@configuration
def add_component(name):
    # TODO: Extremely slow (debug that) so using a custom script for now until debugged
    pass
