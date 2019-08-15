# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import sentry.db.models.fields.bounded
import sentry.db.models.fields.foreignkey
import django.utils.timezone
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('sentry', '0003_auto_20190618_1124'),
        ('clims', '0002_auto_20190523_0909'),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkBatch',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(
                    serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=200, verbose_name=b'name', blank=True)),
                ('handler', models.TextField(verbose_name=b'handler')),
                ('created', models.DateTimeField(default=django.utils.timezone.now,
                                                 verbose_name=b'created', db_index=True)),
                ('extra_fields', models.TextField(verbose_name=b'extra_fields')),
                ('num_comments', sentry.db.models.fields.bounded.BoundedPositiveIntegerField(default=0, null=True)),
                ('status', sentry.db.models.fields.bounded.BoundedPositiveIntegerField(
                    default=0, db_index=True, choices=[(0, 'Unresolved'), (1, 'Resolved'), (2, 'Ignored')])),
                ('organization', sentry.db.models.fields.foreignkey.FlexibleForeignKey(to='sentry.Organization')),
            ],
            options={
                'db_table': 'clims_workbatch',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='WorkBatchAssignee',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(
                    serialize=False, primary_key=True)),
                ('date_added', models.DateTimeField(default=django.utils.timezone.now)),
                ('organization', sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                    related_name='assignee_set', to='sentry.Organization')),
                ('team', sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                    related_name='sentry_assignee_set', to='sentry.Team', null=True)),
                ('user', sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                    related_name='sentry_assignee_set', to=settings.AUTH_USER_MODEL, null=True)),
                ('work_batch', sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                    related_name='assignee_set', to='clims.WorkBatch', unique=True)),
            ],
            options={
                'db_table': 'clims_workbatchassignee',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='WorkBatchFile',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(
                    serialize=False, primary_key=True)),
                ('ident', models.CharField(max_length=40)),
                ('name', models.TextField()),
                ('file', sentry.db.models.fields.foreignkey.FlexibleForeignKey(to='sentry.File')),
                ('organization', sentry.db.models.fields.foreignkey.FlexibleForeignKey(to='sentry.Organization')),
                ('work_batch', sentry.db.models.fields.foreignkey.FlexibleForeignKey(to='clims.WorkBatch')),
            ],
            options={
                'db_table': 'clims_workbatchfile',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='WorkBatchSubscription',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(
                    serialize=False, primary_key=True)),
                ('is_active', models.BooleanField(default=True)),
                ('reason', sentry.db.models.fields.bounded.BoundedPositiveIntegerField(default=0)),
                ('date_added', models.DateTimeField(default=django.utils.timezone.now, null=True)),
                ('user', sentry.db.models.fields.foreignkey.FlexibleForeignKey(to=settings.AUTH_USER_MODEL)),
                ('work_batch', sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                    related_name='subscription_set', to='clims.WorkBatch')),
            ],
            options={
                'db_table': 'clims_workbatchsubscription',
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='resultfile',
            name='user_task',
        ),
        migrations.DeleteModel(
            name='ResultFile',
        ),
        migrations.RemoveField(
            model_name='usertask',
            name='organization',
        ),
        migrations.RemoveField(
            model_name='usertaskassignee',
            name='organization',
        ),
        migrations.RemoveField(
            model_name='usertaskassignee',
            name='team',
        ),
        migrations.RemoveField(
            model_name='usertaskassignee',
            name='user',
        ),
        migrations.RemoveField(
            model_name='usertaskassignee',
            name='user_task',
        ),
        migrations.DeleteModel(
            name='UserTaskAssignee',
        ),
        migrations.AlterUniqueTogether(
            name='usertaskfile',
            unique_together=None,
        ),
        migrations.AlterIndexTogether(
            name='usertaskfile',
            index_together=None,
        ),
        migrations.RemoveField(
            model_name='usertaskfile',
            name='file',
        ),
        migrations.RemoveField(
            model_name='usertaskfile',
            name='organization',
        ),
        migrations.RemoveField(
            model_name='usertaskfile',
            name='user_task',
        ),
        migrations.DeleteModel(
            name='UserTaskFile',
        ),
        migrations.AlterUniqueTogether(
            name='usertasksubscription',
            unique_together=None,
        ),
        migrations.RemoveField(
            model_name='usertasksubscription',
            name='user',
        ),
        migrations.RemoveField(
            model_name='usertasksubscription',
            name='user_task',
        ),
        migrations.DeleteModel(
            name='UserTaskSubscription',
        ),
        migrations.AlterUniqueTogether(
            name='workbatchsubscription',
            unique_together=set([('work_batch', 'user')]),
        ),
        migrations.AlterUniqueTogether(
            name='workbatchfile',
            unique_together=set([('work_batch', 'ident')]),
        ),
        migrations.AlterIndexTogether(
            name='workbatchfile',
            index_together=set([('work_batch', 'name')]),
        ),
        migrations.RemoveField(
            model_name='activityinstance',
            name='user_task',
        ),
    ]
