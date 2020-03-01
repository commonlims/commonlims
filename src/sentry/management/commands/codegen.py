from __future__ import absolute_import, print_function

from django.core.management.base import BaseCommand
from clims.devhelpers.generate import ReduxCodeGenerator


class Command(BaseCommand):
    help = 'Generates Common LIMS code from configuration'

    def add_arguments(self, parser):
        parser.add_argument(
            '--redux',
            action='store_true',
            help='',
        )

    def handle(self, **options):
        if options['redux']:
            gen = ReduxCodeGenerator()
            gen.generate()
