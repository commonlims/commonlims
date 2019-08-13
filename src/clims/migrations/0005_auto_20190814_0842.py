# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import sentry.db.models.fields.foreignkey
import sentry.db.models.fields.bounded


class Migration(migrations.Migration):

    dependencies = [
        ('clims', '0004_auto_20190814_0840'),
    ]

    operations = [
        migrations.CreateModel(
            name='ExtensibleInstance',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(
                    serialize=False, primary_key=True)),
                ('name', models.TextField()),
            ],
            options={
                'db_table': 'clims_extensibleinstance',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ExtensibleType',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(
                    serialize=False, primary_key=True)),
                ('name', models.TextField()),
                ('base_class', models.TextField()),
            ],
            options={
                'db_table': 'clims_extensibletype',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ItemLocation',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(
                    serialize=False, primary_key=True)),
                ('x', models.IntegerField(default=0)),
                ('y', models.IntegerField(default=0)),
                ('z', models.IntegerField(default=0)),
                ('container', sentry.db.models.fields.foreignkey.FlexibleForeignKey(to='clims.Container')),
                ('previous_location', sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                    to='clims.ItemLocation', null=True)),
            ],
            options={
                'db_table': 'clims_itemlocation',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='PluginRegistration',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(
                    serialize=False, primary_key=True)),
                ('name', models.TextField()),
                ('version', models.TextField()),
                ('url', models.TextField(null=True)),
            ],
            options={
                'db_table': 'clims_pluginregistration',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='PropertyInstance',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(
                    serialize=False, primary_key=True)),
                ('float_value', models.FloatField(null=True)),
                ('int_value', models.IntegerField(null=True)),
                ('string_value', models.TextField(null=True)),
                ('version', models.IntegerField(default=1)),
                ('latest', models.BooleanField(default=True)),
                ('instance', sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                    related_name='properties', to='clims.ExtensibleInstance')),
            ],
            options={
                'db_table': 'clims_propertyinstance',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='PropertyType',
            fields=[
                ('id', sentry.db.models.fields.bounded.BoundedBigAutoField(
                    serialize=False, primary_key=True)),
                ('name', models.TextField()),
                ('raw_type', models.TextField(choices=[
                 (b's', b'string'), (b'j', b'json'), (b'i', b'int'), (b'f', b'float'), (b'b', b'bool')])),
                ('display_name', models.TextField()),
                ('extensible_type', sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                    to='clims.ExtensibleType')),
            ],
            options={
                'db_table': 'clims_propertytype',
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='propertyinstance',
            name='property_type',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(to='clims.PropertyType'),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='propertyinstance',
            unique_together=set([('instance', 'version')]),
        ),
        migrations.AddField(
            model_name='extensibletype',
            name='plugin_registration',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                to='clims.PluginRegistration'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='extensibleinstance',
            name='type',
            field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(to='clims.ExtensibleType'),
            preserve_default=True,
        ),
    ]
