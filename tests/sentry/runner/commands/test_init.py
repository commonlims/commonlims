# -*- coding: utf-8 -*-

from __future__ import absolute_import

import os
import six

from sentry.testutils import CliTestCase
from sentry.runner.commands.init import init


class InitTest(CliTestCase):
    command = init

    def test_simple(self):
        with self.runner.isolated_filesystem():
            rv = self.invoke('config')
            assert rv.exit_code == 0, rv.output
            contents = os.listdir('config')
            assert set(contents) == {'clims.conf.py', 'config.yml'}

            # Make sure the python file is valid
            ctx = {'__file__': 'clims.conf.py'}
            with open('config/clims.conf.py') as fp:
                six.exec_(fp.read(), ctx)
            assert 'DEBUG' in ctx

            # Make sure the yaml file is valid
            from sentry.utils.yaml import safe_load
            with open('config/config.yml', 'rb') as fp:
                ctx = safe_load(fp)
            assert 'system.secret-key' in ctx
