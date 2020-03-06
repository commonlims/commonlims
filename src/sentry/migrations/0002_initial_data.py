# -*- coding: utf-8 -*-


from django.db import migrations
from django.conf import settings
from sentry.receivers.core import create_default_project

# This data migration is the one that makes the database look like Sentry would have expected at the
# forkpoint. We can change this file at will until our first release,
# removing stuff not required by clims.


def default_saved_searches(apps, schema_editor):
    # TODO: I think we should rather define built-in saved searches in plugins, adding them when the plugin
    # is registered. But we'll add this for now.

    # 0232_default_savedsearch.py
    Project = apps.get_model('sentry', 'Project')
    SavedSearch = apps.get_model('sentry', 'SavedSearch')
    queryset = Project.objects.filter(
        status=0,
    )

    for project in queryset:
        SavedSearch.objects.get_or_create(
            project=project,
            name='Unresolved Issues',
            query='is:unresolved',
            is_default=True,
        )

        SavedSearch.objects.get_or_create(
            project=project,
            name='Needs Triage',
            query='is:unresolved is:unassigned',
        )

        SavedSearch.objects.get_or_create(
            project=project,
            name='Assigned To Me',
            query='is:unresolved assigned:me',
        )

        SavedSearch.objects.get_or_create(
            project=project,
            name='My Bookmarks',
            query='is:unresolved bookmarks:me',
        )

        SavedSearch.objects.get_or_create(
            project=project,
            name='New Today',
            query='is:unresolved age:-24h',
        )


class Migration(migrations.Migration):

    dependencies = [
        ('sentry', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(default_saved_searches)
    ]
