# -*- coding: utf-8 -*-
# Generated by Django 1.9.13 on 2020-12-14 14:13
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clims', '0021_auto_20201110_0806'),
    ]

    operations = [
        migrations.AddField(
            model_name='workbatch',
            name='input_containers',
            field=models.ManyToManyField(to='clims.Container'),
        ),
    ]
