# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('clims', '0004_auto_20190814_0840'),
    ]

    operations = [
        migrations.CreateModel(
            name='CamundaProcess',
            fields=[
                ('id', models.TextField(serialize=False, primary_key=True, db_column=b'id_')),
                ('rev', models.IntegerField(db_column=b'rev_')),
                ('category', models.TextField(db_column=b'category_')),
                ('name', models.TextField(db_column=b'name_')),
                ('key', models.TextField(db_column=b'key_')),
                ('version', models.IntegerField(db_column=b'version_')),
                ('deployment', models.TextField(db_column=b'deployment_id_')),
                ('resource_name', models.TextField(db_column=b'resource_name_')),
                ('dgrm_resource_name', models.TextField(db_column=b'dgrm_resource_name_')),
                ('has_start_form_key', models.BooleanField(default=None, db_column=b'has_start_form_key_')),
                ('suspension_state', models.IntegerField(db_column=b'suspension_state_')),
                ('tenant', models.TextField(db_column=b'tenant_id_')),
                ('version_tag', models.TextField(db_column=b'version_tag_')),
                ('history_ttl', models.IntegerField(db_column=b'history_ttl_')),
                ('startable', models.BooleanField(default=None, db_column=b'startable_')),
            ],
            options={
                'db_table': 'act_re_procdef',
                'managed': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='CamundaTask',
            fields=[
                ('id', models.TextField(serialize=False, primary_key=True, db_column=b'id_')),
                ('rev', models.IntegerField(db_column=b'rev_')),
                ('execution', models.TextField(db_column=b'execution_id_')),
                ('process_instance', models.TextField(db_column=b'proc_inst_id_')),
                ('case_execution', models.TextField(db_column=b'case_execution_id_')),
                ('case_instance', models.TextField(db_column=b'case_inst_id_')),
                ('case_definition', models.TextField(db_column=b'case_def_id_')),
                ('name', models.TextField(db_column=b'name_')),
                ('parent_task', models.TextField(db_column=b'parent_task_id')),
                ('description', models.TextField(db_column=b'description_')),
                ('task_def_key', models.TextField(db_column=b'task_def_key_')),
                ('owner', models.TextField(db_column=b'owner_')),
                ('delegation', models.TextField(db_column=b'delegation_')),
                ('priority', models.IntegerField(db_column=b'priority_')),
                ('created', models.DateTimeField(db_column=b'create_time_')),
                ('assignee', models.TextField(db_column=b'assignee_')),
                ('due_date', models.DateTimeField(db_column=b'due_date_')),
                ('follow_up_date', models.DateTimeField(db_column=b'follow_up_date_')),
                ('suspension_state', models.IntegerField(db_column=b'suspension_state_')),
                ('tenant_id', models.TextField(db_column=b'tenant_id_')),
            ],
            options={
                'db_table': 'act_ru_task',
                'managed': False,
            },
            bases=(models.Model,),
        ),
    ]
