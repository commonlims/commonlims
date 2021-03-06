# -*- coding: utf-8 -*-
# Generated by Django 1.9.13 on 2020-09-24 11:26
from __future__ import unicode_literals

from django.db import migrations
import django.db.models.deletion
import sentry.db.models.fields.foreignkey


class Migration(migrations.Migration):

    dependencies = [
        ('clims', '0016_workunit'),
    ]

    operations = [
        migrations.AddField(
            model_name='container',
            name='work_batch',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='output_containers', to='clims.WorkBatch'),
        ),
    ]
