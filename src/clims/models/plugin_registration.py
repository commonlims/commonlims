from __future__ import absolute_import


from django.db import models
from sentry.db.models import (Model, sane_repr)


class PluginRegistration(Model):
    """
    Lists every registration of a plugin, ensuring that configuration created by a plugin can be traced to a particular
    version of that plugin.

    Take for example a look at the ItemType model. When a plugin registers a particular

    If you start the service with a particular version of a plugin (e.g. clims_genetics@1.0.0) and then update
    it only at 2.0.0, we'll only have a record of those two plugins on the system, even if there are more
    available on PyPi.
    """

    __core__ = True

    name = models.TextField(null=False)
    version = models.TextField(null=False)

    # The URL from which the plugin was installed. If null, pypi is assumed.
    url = models.TextField(null=True)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_pluginregistration'

    __repr__ = sane_repr('name', 'version')
