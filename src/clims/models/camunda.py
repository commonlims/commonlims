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

    class Meta:
        db_table = 'act_re_procdef'
        managed = False

    __repr__ = sane_repr('name')


class CamundaTask(models.Model):
    __core__ = False

    id = models.TextField(db_column='id_', primary_key=True)

    process = models.ForeignKey('CamundaProcess', 'id', db_column='proc_def_id_')
    name = models.TextField(db_column='name_')
    description = models.TextField(db_column='description_')
    definition_key = models.TextField(db_column='task_def_key_')
    priority = models.TextField(db_column='priority_')
    created = models.DateTimeField(db_column='create_time_')
    assignee = models.TextField(db_column='assignee_')

    class Meta:
        db_table = 'act_ru_task'
        managed = False

    __repr__ = sane_repr('name')
