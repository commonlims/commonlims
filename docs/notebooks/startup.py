from uuid import uuid4
from sentry.runner import configure
configure()
from clims.models import *
from clims.services import *
from sentry.models import *
org = Organization.objects.get(name='lab')

from sentry.testutils.fixtures import Fixtures

app = ApplicationService()
ioc.set_application(app)
notebook_plugin, _ = PluginRegistration.objects.get_or_create(
    name='clims.notebooks.plugin', version='1.0.0', organization=org)


def unique_name(prefix):
    return "{}-{}".format(prefix, uuid4())
