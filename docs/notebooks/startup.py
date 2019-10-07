from sentry.runner import configure
configure()
from clims.models import *
from clims.services import *
from sentry.models import *
org = Organization.objects.get(name='lab')
print("Setup has run and default imports are available")
