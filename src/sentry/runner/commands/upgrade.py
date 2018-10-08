"""
sentry.runner.commands.upgrade
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

:copyright: (c) 2015 by the Sentry Team, see AUTHORS for more details.
:license: BSD, see LICENSE for more details.
"""
from __future__ import absolute_import, print_function

import click
import django

from django.conf import settings
from sentry.runner.decorators import configuration
import logging
from clims.workflow import WorkflowEngine, WorkflowEngineException

logger = logging.getLogger(__name__)

DJANGO_17 = django.VERSION[0] > 1 or (django.VERSION[0] == 1 and django.VERSION[1] >= 7)


def _upgrade(interactive, traceback, verbosity, repair):
    from django.core.management import call_command as dj_call_command
    logger.info("Updating workflow definitions")

    from sentry.plugins import plugins
    for plugin in plugins.all(2):
        definitions = list(plugin.workflow_definitions())
        workflows = WorkflowEngine()
        # TODO: Validate that each workflow has a valid name, corresponding with
        # the name of the plugin
        if definitions:
            for definition in definitions:
                import os
                file_name = os.path.basename(definition)
                try:
                    workflows.deploy(definition)
                    logger.info(
                        "Uploaded workflow definition {} for plugin {}".format(
                            file_name, plugin))
                except WorkflowEngineException:
                    # TODO: Disable the plugin in this case (if not in dev mode)
                    logger.warning(
                        "Can't upload workflow definition {} for plugin {}".format(
                            file_name, plugin))

    if 'south' in settings.INSTALLED_APPS or DJANGO_17:
        dj_call_command(
            'migrate',
            interactive=interactive,
            traceback=traceback,
            verbosity=verbosity,
            migrate=True,
            merge=True,
            ignore_ghost_migrations=True,
        )
    else:
        dj_call_command(
            'syncdb',
            interactive=interactive,
            traceback=traceback,
            verbosity=verbosity,
        )

    if repair:
        from sentry.runner import call_command
        call_command(
            'sentry.runner.commands.repair.repair',
        )


@click.command()
@click.option('--verbosity', '-v', default=1, help='Verbosity level.')
@click.option('--traceback', default=True, is_flag=True, help='Raise on exception.')
@click.option(
    '--noinput', default=False, is_flag=True, help='Do not prompt the user for input of any kind.'
)
@click.option(
    '--lock',
    default=False,
    is_flag=True,
    help='Hold a global lock and limit upgrade to one concurrent.'
)
@click.option('--no-repair', default=False, is_flag=True, help='Skip repair step.')
@configuration
@click.pass_context
def upgrade(ctx, verbosity, traceback, noinput, lock, no_repair):
    "Perform any pending database migrations and upgrades."

    if lock:
        from sentry.app import locks
        from sentry.utils.locking import UnableToAcquireLock
        lock = locks.get('upgrade', duration=0)
        try:
            with lock.acquire():
                _upgrade(not noinput, traceback, verbosity, not no_repair)
        except UnableToAcquireLock:
            raise click.ClickException('Unable to acquire `upgrade` lock.')
    else:
        _upgrade(not noinput, traceback, verbosity, not no_repair)
