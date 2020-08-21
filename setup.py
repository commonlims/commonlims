#!/usr/bin/env python
"""
Common LIMS
======

Original copyright:

:copyright: (c) 2011-2014 by the Sentry Team, see AUTHORS for more details.
:license: BSD, see LICENSE for more details.
"""
from __future__ import absolute_import

# if sys.version_info[:2] != (2, 7):
#     print 'Error: Sentry requires Python 2.7'
#     sys.exit(1)

import re
import os
import os.path
import sys

from distutils.command.build import build as BuildCommand
from setuptools import setup, find_packages
from setuptools.command.sdist import sdist as SDistCommand
from setuptools.command.develop import develop as DevelopCommand

ROOT = os.path.realpath(os.path.join(os.path.dirname(
    sys.modules['__main__'].__file__)))

# Add Sentry to path so we can import distutils
sys.path.insert(0, os.path.join(ROOT, 'src'))

from sentry.utils.distutils import (
    BuildAssetsCommand, BuildJsSdkRegistryCommand
)

# The version of sentry
VERSION = '9.1.0.dev0'

# Hack to prevent stupid "TypeError: 'NoneType' object is not callable" error
# in multiprocessing/util.py _exit_function when running `python
# setup.py test` (see
# http://www.eby-sarna.com/pipermail/peak/2010-May/003357.html)
for m in ('multiprocessing', 'billiard'):
    try:
        __import__(m)
    except ImportError:
        pass

IS_LIGHT_BUILD = os.environ.get('CLIMS_LIGHT_BUILD') == '1'

# we use pip requirements files to improve Docker layer caching

# git+git@github.com:commonlims/django-templatetag-sugar.git@master#egg=django_templatetag_sugar
GIT_REGEX = re.compile(r'^git+.*/(.*)\.git.*')


def parse_req(line):
    m = GIT_REGEX.search(line)
    if m:
        return m.group(1)
    return line


def get_requirements(env):
    with open(u'requirements-{}.txt'.format(env)) as fp:
        return [parse_req(x.strip()) for x in fp.read().split('\n') if not x.startswith('#')]


install_requires = get_requirements('base')
dev_requires = get_requirements('dev')
tests_require = get_requirements('test')
optional_requires = get_requirements('optional')


class SentrySDistCommand(SDistCommand):
    # If we are not a light build we want to also execute build_assets as
    # part of our source build pipeline.
    if not IS_LIGHT_BUILD:
        sub_commands = SDistCommand.sub_commands + \
            [('build_assets', None),
             ('build_js_sdk_registry', None)]


class SentryBuildCommand(BuildCommand):
    def run(self):
        BuildCommand.run(self)
        if not IS_LIGHT_BUILD:
            self.run_command('build_assets')
            self.run_command('build_js_sdk_registry')


class SentryDevelopCommand(DevelopCommand):
    def run(self):
        DevelopCommand.run(self)
        if not IS_LIGHT_BUILD:
            self.run_command('build_assets')
            self.run_command('build_js_sdk_registry')


cmdclass = {
    'sdist': SentrySDistCommand,
    'develop': SentryDevelopCommand,
    'build': SentryBuildCommand,
    'build_assets': BuildAssetsCommand,
    'build_js_sdk_registry': BuildJsSdkRegistryCommand,
}


setup(
    name='clims',
    version=VERSION,
    author='https://github.com/commonlims/commonlims/AUTHORS',
    author_email='https://gitter.im/commonlims/community',
    url='https://github.com/commonlims/commonlims',
    description='An extensible free and open source LIMS.',
    long_description=open(os.path.join(ROOT, 'README.md')).read(),
    package_dir={'': 'src'},
    packages=find_packages('src'),
    zip_safe=False,
    install_requires=install_requires,
    extras_require={
        'dev': dev_requires,
        'postgres': [],
        'tests': tests_require,
        'optional': optional_requires,
    },
    cmdclass=cmdclass,
    license='BSD',
    include_package_data=True,
    entry_points={
        'console_scripts': [
            'sentry = sentry.runner:main',
            'lims = sentry.runner:main'
        ],
    },
    classifiers=[
        'Framework :: Django',
        'Intended Audience :: Developers',
        'Intended Audience :: System Administrators',
        'Operating System :: POSIX :: Linux',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 2 :: Only',
        'Topic :: Software Development'
    ],
)
