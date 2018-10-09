# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    # Flag to indicate if this migration is too risky
    # to run online and needs to be coordinated for offline
    is_dangerous = False

    def forwards(self, orm):
        pass

    def backwards(self, orm):
        pass

    models = {

    }

    complete_apps = ['clims']
