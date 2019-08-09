# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import sentry.db.models.fields.foreignkey


class Migration(migrations.Migration):

    dependencies = [
        ('sentry', '0004_auto_20190814_0840'),
        ('clims', '0003_auto_20190814_0840'),
    ]

    operations = [
        migrations.DeleteModel(
            name='UserTask',
        ),
        migrations.AddField(
            model_name='activityinstance',
            name='work_batch',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                to='clims.WorkBatch', null=True),
            preserve_default=True,
        ),
    ]
