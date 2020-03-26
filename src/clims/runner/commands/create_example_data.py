from __future__ import absolute_import, print_function


import click
from clims.handlers import CreateContext
from sentry.runner.decorators import configuration


@click.command()
@configuration
def createexampledata():
    """
    Create example data for clims
    """

    # TODO: We currently import all demo data supplied by all plugins. It would make sense
    # for users to be able to select which plugin's data should run by supplying a handler
    # regex. E.g: `lims createexampledata plugin='clims.plugins.*'`
    from clims.services.application import ioc, ApplicationService
    from sentry.models.organization import Organization

    app = ApplicationService()
    ioc.set_application(app)

    org = Organization.objects.get(name="lab")

    from clims.plugins.demo.dnaseq import DemoDnaSeqPlugin
    from clims.handlers import CreateExampleDataHandler

    app.plugins.install_plugins(DemoDnaSeqPlugin)
    app.plugins.load_installed()

    # Now we'll run the handlers for all plugins (one of them being the DemoPlugin) for
    # creating example data. All plugins can plug into this behaviour by implementing the
    # CreateExampleDataHandler:

    with CreateContext(app, org, None) as context:
        app.plugins.handlers.handle(CreateExampleDataHandler, context, required=False)
