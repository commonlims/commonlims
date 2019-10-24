# -*- coding: utf-8 -*-
# Generated by Django 1.9.13 on 2019-10-22 16:41
from __future__ import unicode_literals

from django.db import migrations
import django.db.models.deletion
import sentry.db.models.fields.foreignkey


class Migration(migrations.Migration):

    dependencies = [
        ('clims', '0003_auto_20191021_1118'),
    ]

    operations = [
        migrations.AlterField(
            model_name='location',
            name='container',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='locations', to='clims.Container'),
        ),
    ]