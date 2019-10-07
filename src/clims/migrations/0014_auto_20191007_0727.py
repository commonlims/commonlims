# -*- coding: utf-8 -*-
# Generated by Django 1.9.13 on 2019-10-07 07:27
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import sentry.db.models.fields.bounded


class Migration(migrations.Migration):

    dependencies = [
        ('clims', '0013_location_transition'),
    ]

    operations = [
        migrations.CreateModel(
            name='SubstanceVersion',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(primary_key=True, serialize=False)),
                ('previous_name', models.TextField(null=True)),
                ('version', models.IntegerField(default=1)),
                ('latest', models.BooleanField(default=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.RemoveField(
            model_name='extensibleproperty',
            name='extensible_property_value',
        ),
        migrations.RemoveField(
            model_name='extensibleproperty',
            name='latest',
        ),
        migrations.RemoveField(
            model_name='extensibleproperty',
            name='version',
        ),
        migrations.RemoveField(
            model_name='substance',
            name='properties',
        ),
        migrations.RemoveField(
            model_name='substance',
            name='version',
        ),
        migrations.AddField(
            model_name='extensibleproperty',
            name='bool_value',
            field=models.NullBooleanField(),
        ),
        migrations.AddField(
            model_name='extensibleproperty',
            name='float_value',
            field=models.FloatField(null=True),
        ),
        migrations.AddField(
            model_name='extensibleproperty',
            name='int_value',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='extensibleproperty',
            name='string_value',
            field=models.TextField(null=True),
        ),
        migrations.AlterField(
            model_name='substance',
            name='parents',
            field=models.ManyToManyField(related_name='children', to='clims.SubstanceVersion'),
        ),
        migrations.DeleteModel(
            name='ExtensiblePropertyValue',
        ),
        migrations.AddField(
            model_name='substanceversion',
            name='properties',
            field=models.ManyToManyField(to='clims.ExtensibleProperty'),
        ),
        migrations.AddField(
            model_name='substanceversion',
            name='substance',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='versions', to='clims.Substance'),
        ),
    ]
