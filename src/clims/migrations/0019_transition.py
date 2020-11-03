# -*- coding: utf-8 -*-
# Generated by Django 1.9.13 on 2020-10-26 10:31
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import sentry.db.models.fields.bounded
import sentry.db.models.fields.foreignkey


class Migration(migrations.Migration):

    dependencies = [
        ('sentry', '0005_auto_20190911_0655'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('clims', '0018_merge'),
    ]

    operations = [
        migrations.CreateModel(
            name='Transition',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(primary_key=True, serialize=False)),
                ('transition_type', models.IntegerField(default=0)),
                ('organization', sentry.db.models.fields.foreignkey.FlexibleForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sentry.Organization')),
                ('source_location', sentry.db.models.fields.foreignkey.FlexibleForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='source_transitions', to='clims.SubstanceLocation')),
                ('source_substance', sentry.db.models.fields.foreignkey.FlexibleForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='source_transitions', to='clims.Substance')),
                ('target_location', sentry.db.models.fields.foreignkey.FlexibleForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='target_transitions', to='clims.SubstanceLocation')),
                ('target_substance', sentry.db.models.fields.foreignkey.FlexibleForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='target_transitions', to='clims.Substance')),
                ('user', sentry.db.models.fields.foreignkey.FlexibleForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transitions', to=settings.AUTH_USER_MODEL)),
                ('work_batch', sentry.db.models.fields.foreignkey.FlexibleForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='transitions', to='clims.WorkBatch')),
            ],
            options={
                'db_table': 'clims_transition',
            },
        ),
    ]