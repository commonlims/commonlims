# -*- coding: utf-8 -*-
# Generated by Django 1.9.13 on 2020-01-09 13:21
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('clims', '0011_auto_20191106_1509'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='extensibletype',
            name='category',
        ),
    ]
