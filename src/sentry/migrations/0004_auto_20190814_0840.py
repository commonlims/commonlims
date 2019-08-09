# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import sentry.db.models.fields.foreignkey


class Migration(migrations.Migration):

    dependencies = [
        ('clims', '0003_auto_20190814_0840'),
        ('sentry', '0003_auto_20190618_1124'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='activity',
            name='user_task',
        ),
        migrations.AddField(
            model_name='activity',
            name='work_batch',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                to='clims.WorkBatch', null=True),
            preserve_default=True,
        ),
    ]
