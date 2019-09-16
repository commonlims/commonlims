"""
Provides various helper methods ensuring certain data exists for tests
"""
from __future__ import absolute_import
from clims.models import (
    PluginRegistration, ExtensiblePropertyType)
from sentry.models import Organization
from uuid import uuid4
from clims.services import substances


def create_organization():
    org = Organization.objects.get(name='lab')
    return org


def create_plugin(org=None):
    org = org or create_organization()
    plugin, _ = PluginRegistration.objects.get_or_create(
        name='tests_utils.create_plugin', version='1.0.0', organization=org)
    return plugin


def create_substance_type(name=None, org=None, plugin=None, properties=None):
    name = name or 'GemstoneSample'
    properties = properties or [
        dict(name='color', raw_type=ExtensiblePropertyType.STRING, display_name='Col.'),
        dict(name='preciousness', raw_type=ExtensiblePropertyType.STRING, display_name='Prec.'),
        dict(name='payload', raw_type=ExtensiblePropertyType.JSON, display_name='Payload'),
    ]
    plugin = plugin or create_plugin()

    substance_type = substances.register_type(name, 'substances', plugin, properties=properties)

    return substance_type


def create_substance(name=None, properties=None, substance_type=None, org=None):
    org = org or create_organization()
    substance_type = substance_type or create_substance_type(org=org)
    if not name:
        name = "sample-{}".format(uuid4())

    substance = substances.create(
        name=name,
        extensible_type=substance_type,
        organization=org,
        properties=properties
    )
    return substance
