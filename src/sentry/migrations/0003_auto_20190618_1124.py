# -*- coding: utf-8 -*-


from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sentry', '0002_initial_data'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='projectcficachefile',
            unique_together=None,
        ),
        migrations.RemoveField(
            model_name='projectcficachefile',
            name='cache_file',
        ),
        migrations.RemoveField(
            model_name='projectcficachefile',
            name='debug_file',
        ),
        migrations.RemoveField(
            model_name='projectcficachefile',
            name='project',
        ),
        migrations.DeleteModel(
            name='ProjectCfiCacheFile',
        ),
        migrations.AlterIndexTogether(
            name='projectdebugfile',
            index_together=None,
        ),
        migrations.RemoveField(
            model_name='projectdebugfile',
            name='file',
        ),
        migrations.RemoveField(
            model_name='projectdebugfile',
            name='project',
        ),
        migrations.AlterUniqueTogether(
            name='projectsymcachefile',
            unique_together=None,
        ),
        migrations.RemoveField(
            model_name='projectsymcachefile',
            name='cache_file',
        ),
        migrations.RemoveField(
            model_name='projectsymcachefile',
            name='debug_file',
        ),
        migrations.DeleteModel(
            name='ProjectDebugFile',
        ),
        migrations.RemoveField(
            model_name='projectsymcachefile',
            name='project',
        ),
        migrations.DeleteModel(
            name='ProjectSymCacheFile',
        ),
    ]
