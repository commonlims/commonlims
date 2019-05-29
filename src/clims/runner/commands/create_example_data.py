
from __future__ import absolute_import, print_function

import click
from sentry.runner.decorators import configuration


@click.command()
@configuration
def createexampledata():
    """
    Create example data for clims
    """

    # Import models here because they need to be wrapped with a Django context to work.
    # /JD 2019-05-27
    from clims.models.user_task import UserTask
    UserTask.objects.create(name="Test1", organization_id=1, handler="somehandler")
    UserTask.objects.create(name="Test2", organization_id=1, handler="somehandler2")
    UserTask.objects.create(name="Test3", organization_id=1, handler="somehandler2")
