# -*- coding: utf-8 -*-
# Generated by Django 1.9.13 on 2020-07-31 15:01
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import sentry.db.models.fields.bounded
import sentry.db.models.fields.foreignkey


class Migration(migrations.Migration):

    dependencies = [
        ('sentry', '0005_auto_20190911_0655'),
        ('clims', '0014_auto_20200318_1423'),
    ]

    operations = [
        migrations.CreateModel(
            name='Step',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.TextField()),
                ('extensible_type', sentry.db.models.fields.foreignkey.FlexibleForeignKey(on_delete=django.db.models.deletion.CASCADE, to='clims.ExtensibleType')),
                ('organization', sentry.db.models.fields.foreignkey.FlexibleForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='steps', to='sentry.Organization')),
            ],
            options={
                'db_table': 'clims_step',
            },
        ),
        migrations.CreateModel(
            name='StepVersion',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(primary_key=True, serialize=False)),
                ('name', models.TextField(null=True)),
                ('version', models.IntegerField(default=1)),
                ('latest', models.BooleanField(default=True)),
                ('archetype', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='versions', to='clims.Step')),
                ('properties', models.ManyToManyField(to='clims.ExtensibleProperty')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AlterUniqueTogether(
            name='step',
            unique_together=set([('name', 'organization')]),
        ),
    ]