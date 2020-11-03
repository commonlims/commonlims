# -*- coding: utf-8 -*-
# Generated by Django 1.9.13 on 2020-11-03 12:56
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import sentry.db.models.fields.bounded
import sentry.db.models.fields.foreignkey


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('clims', '0019_auto_20201028_1244'),
    ]

    operations = [
        migrations.CreateModel(
            name='Transition',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(primary_key=True, serialize=False)),
                ('transition_type', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('source_location', sentry.db.models.fields.foreignkey.FlexibleForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='source_transitions', to='clims.SubstanceLocation')),
                ('target_location', sentry.db.models.fields.foreignkey.FlexibleForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='target_transitions', to='clims.SubstanceLocation')),
                ('user', sentry.db.models.fields.foreignkey.FlexibleForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transitions', to=settings.AUTH_USER_MODEL)),
                ('work_batch', sentry.db.models.fields.foreignkey.FlexibleForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='transitions', to='clims.WorkBatch')),
            ],
            options={
                'db_table': 'clims_transition',
            },
        ),
    ]
