# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import sentry.db.models.fields.foreignkey


class Migration(migrations.Migration):

    dependencies = [
        ('sentry', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('clims', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='usertasksubscription',
            name='user',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(to=settings.AUTH_USER_MODEL),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='usertasksubscription',
            name='user_task',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(related_name='subscription_set', to='clims.UserTask'),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='usertasksubscription',
            unique_together=set([('user_task', 'user')]),
        ),
        migrations.AddField(
            model_name='usertaskfile',
            name='file',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(to='sentry.File'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='usertaskfile',
            name='organization',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(to='sentry.Organization'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='usertaskfile',
            name='user_task',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(to='clims.UserTask'),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='usertaskfile',
            unique_together=set([('user_task', 'ident')]),
        ),
        migrations.AlterIndexTogether(
            name='usertaskfile',
            index_together=set([('user_task', 'name')]),
        ),
        migrations.AddField(
            model_name='usertaskassignee',
            name='organization',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(related_name='assignee_set', to='sentry.Organization'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='usertaskassignee',
            name='team',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(related_name='sentry_assignee_set', to='sentry.Team', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='usertaskassignee',
            name='user',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(related_name='sentry_assignee_set', to=settings.AUTH_USER_MODEL, null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='usertaskassignee',
            name='user_task',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(related_name='assignee_set', to='clims.UserTask', unique=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='usertask',
            name='organization',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(to='sentry.Organization'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='sample',
            name='parents',
            field=models.ManyToManyField(related_name='parents_rel_+', to='clims.Sample'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='sample',
            name='project',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(related_name='samples', to='sentry.Project', null=True),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='sample',
            unique_together=set([('project', 'name')]),
        ),
        migrations.AddField(
            model_name='resultfile',
            name='user_task',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(to='clims.UserTask'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='container',
            name='container_type',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(related_name='containers', to='clims.ContainerType', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='container',
            name='parent',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(related_name='children_set', to='clims.Container', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='activityinstance',
            name='sample',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(to='clims.Sample'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='activityinstance',
            name='user_task',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(to='clims.UserTask'),
            preserve_default=True,
        ),
    ]
