from __future__ import absolute_import, print_function

from django.db import models
from sentry.db.models import sane_repr

# Models for camunda. None of these is created by CLIMS, but we require them here for querying them more easily
# when the API isn't enough


class CamundaProcess(models.Model):
    __core__ = False

    id = models.TextField(db_column='id_', primary_key=True)
    rev = models.IntegerField(db_column='rev_')
    category = models.TextField(db_column='category_')
    name = models.TextField(db_column='name_')
    key = models.TextField(db_column='key_')

    version = models.IntegerField(db_column='version_')
    deployment = models.TextField(db_column='deployment_id_')
    resource_name = models.TextField(db_column='resource_name_')
    dgrm_resource_name = models.TextField(db_column='dgrm_resource_name_')
    has_start_form_key = models.BooleanField(db_column='has_start_form_key_',
                                             default=None)
    suspension_state = models.IntegerField(db_column='suspension_state_')
    tenant = models.TextField(db_column='tenant_id_')
    version_tag = models.TextField(db_column='version_tag_')
    history_ttl = models.IntegerField(db_column='history_ttl_')
    startable = models.BooleanField(db_column='startable_', default=None)

    class Meta:
        db_table = 'act_re_procdef'
        managed = False

    __repr__ = sane_repr('name')


class CamundaTask(models.Model):
    __core__ = False

    id = models.TextField(db_column='id_', primary_key=True)

    rev = models.IntegerField(db_column='rev_')
    execution = models.TextField(db_column='execution_id_')
    process_instance = models.TextField(db_column='proc_inst_id_')
    process_definition = models.ForeignKey('CamundaProcess',
                                           'id',
                                           db_column='proc_def_id_')

    case_execution = models.TextField(db_column='case_execution_id_')
    case_instance = models.TextField(db_column='case_inst_id_')
    case_definition = models.TextField(db_column='case_def_id_')
    name = models.TextField(db_column='name_')
    parent_task = models.TextField(db_column='parent_task_id_')
    description = models.TextField(db_column='description_')
    task_definition_key = models.TextField(db_column='task_def_key_')
    owner = models.TextField(db_column='owner_')
    assignee = models.TextField(db_column='assignee_')
    delegation = models.TextField(db_column='delegation_')

    priority = models.IntegerField(db_column='priority_')
    created = models.DateTimeField(db_column='create_time_')
    assignee = models.TextField(db_column='assignee_')

    due_date = models.DateTimeField(db_column='due_date_')
    follow_up_date = models.DateTimeField(db_column='follow_up_date_')

    suspension_state = models.IntegerField(db_column='suspension_state_')
    tenant_id = models.TextField(db_column='tenant_id_')

    class Meta:
        db_table = 'act_ru_task'
        managed = False

    __repr__ = sane_repr('name')
