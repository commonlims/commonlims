# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone
import sentry.db.models.fields.bounded


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ActivityInstance',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('external_id', models.TextField()),
            ],
            options={
                'db_table': 'clims_activityinstance',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Container',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('name', models.TextField(null=True)),
            ],
            options={
                'db_table': 'clims_container',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ContainerType',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('name', models.TextField(null=True)),
                ('rows', models.IntegerField(verbose_name=b'rows')),
                ('cols', models.IntegerField(verbose_name=b'cols')),
                ('levels', models.IntegerField(default=1, verbose_name=b'levels')),
            ],
            options={
                'db_table': 'clims_container_type',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ResultFile',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=200, verbose_name=b'name', blank=True)),
                ('contents', models.TextField(verbose_name=b'contents')),
            ],
            options={
                'db_table': 'clims_result_file',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Sample',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('name', models.TextField(null=True)),
                ('type', models.TextField(null=True)),
                ('concentration', models.FloatField(null=True)),
                ('volume', models.FloatField(null=True)),
                ('custom_fields', models.TextField(null=True)),
                ('depth', models.IntegerField(default=1)),
                ('version', models.IntegerField(default=1)),
            ],
            options={
                'db_table': 'clims_sample',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='UserTask',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=200, verbose_name=b'name', blank=True)),
                ('handler', models.TextField(verbose_name=b'handler')),
                ('created', models.DateTimeField(default=django.utils.timezone.now, verbose_name=b'created', db_index=True)),
                ('extra_fields', models.TextField(verbose_name=b'extra_fields')),
                ('num_comments', sentry.db.models.fields.bounded.BoundedPositiveIntegerField(default=0, null=True)),
                ('status', sentry.db.models.fields.bounded.BoundedPositiveIntegerField(default=0, db_index=True, choices=[(0, 'Unresolved'), (1, 'Resolved'), (2, 'Ignored')])),
            ],
            options={
                'db_table': 'clims_usertask',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='UserTaskAssignee',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('date_added', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'clims_usertaskasignee',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='UserTaskFile',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('ident', models.CharField(max_length=40)),
                ('name', models.TextField()),
            ],
            options={
                'db_table': 'clims_usertaskfile',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='UserTaskSubscription',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('is_active', models.BooleanField(default=True)),
                ('reason', sentry.db.models.fields.bounded.BoundedPositiveIntegerField(default=0)),
                ('date_added', models.DateTimeField(default=django.utils.timezone.now, null=True)),
            ],
            options={
                'db_table': 'clims_usertasksubscription',
            },
            bases=(models.Model,),
        ),
    ]
