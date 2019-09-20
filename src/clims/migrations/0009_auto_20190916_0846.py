# -*- coding: utf-8 -*-
# Generated by Django 1.9.13 on 2019-09-16 08:46
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('clims', '0008_pluginregistration'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='sample',
            unique_together=set([]),
        ),
        migrations.RemoveField(
            model_name='sample',
            name='parents',
        ),
        migrations.RemoveField(
            model_name='sample',
            name='project',
        ),
        migrations.DeleteModel(
            name='Sample',
        ),
    ]