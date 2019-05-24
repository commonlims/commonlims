from __future__ import absolute_import, print_function

from django.conf.urls import patterns, url

from .endpoints.user_task import UserTaskEndpoint, UserTaskDetailsEndpoint, UserTaskDetailsActivityEndpoint

from .endpoints.sample import SampleEndpoint, SampleBatchEndpoint
from .endpoints.samples_details import SampleDetailsEndpoint, SampleWorkflowsEndpoint, SampleProcessesEndpoint, SampleWorkflowsBatchEndpoint

from .endpoints.processes import ProcessesEndpoint, TaskGroupsEndpoint
from .endpoints.process_definitions import ProcessDefinitionsEndpoint

from .endpoints.task_types import TaskTypesEndpoint

from .endpoints.user_files import UserFilesEndpoint

from .endpoints.user_task_files import UserTaskFilesEndpoint
from .endpoints.user_task_file_details import UserTaskFileDetailsEndpoint

from .endpoints.user_task_settings import UserTaskSettingsEndpoint, UserTaskSettingsDetailsEndpoint

from .endpoints.user_task_notes import UserTaskNotesEndpoint
from .endpoints.user_task_notes_details import UserTaskNotesDetailsEndpoint

from .endpoints.plugin_actions import PluginActionsEndpoint
from .endpoints.plugin_views import PluginViewsEndpoint

urlpatterns = patterns(
    # Samples: TODO: have them per organization (that is in projects that are per organization)
    # TODO: Should be items
    url(r'^samples/$', SampleEndpoint.as_view(), name='sentry-api-0-samples'),
    url(r'^samples/(?P<sample_id>[^\/]+)/$',
        SampleDetailsEndpoint.as_view(),
        name='sentry-api-0-sample-details'
        ),

    # USER TASKS
    # TODO: Remove orgs from all but the index one
    url(r'^user-tasks/(?P<user_task_id>[^\/]+)/activity/$',
        UserTaskDetailsActivityEndpoint.as_view(),
        name='sentry-api-0-user-task-details-activity'),

    url(r'^user-tasks/(?P<user_task_id>[^\/]+)/$',
        UserTaskDetailsEndpoint.as_view(),
        name='sentry-api-0-user-task-details'),

    url(
        r'^user-tasks/(?P<user_task_id>[^\/]+)/comments/$',
        UserTaskNotesEndpoint.as_view(),
        name='sentry-api-0-group-notes'
    ),
    url(
        r'^user-tasks/(?P<user_task_id>[^\/]+)/comments/$(?P<note_id>[^\/]+)/',
        UserTaskNotesDetailsEndpoint.as_view(),
        name='sentry-api-0-group-notes-details'
    ),

    url(r'^user-task-settings/(?P<organization_slug>[^\/]+)/$',
        UserTaskSettingsEndpoint.as_view(),
        name='sentry-api-0-user-task-settings'),

    url(r'^user-task-settings/(?P<user_task_type>[^\/]+)/$',
        UserTaskSettingsDetailsEndpoint.as_view(),
        name='sentry-api-0-user-task-settings-details'),

    url(r'^sample-batches/$', SampleBatchEndpoint.as_view(), name='sentry-api-0-sample-batches'),

    # Sample level workflows for this sample
    url(r'^samples/(?P<sample_id>[^\/]+)/workflows/$',
        SampleWorkflowsEndpoint.as_view(),
        name='sentry-api-0-sample-details-workflows'
        ),

    # Sample level workflows for this sample
    url(r'^samples/(?P<sample_id>[^\/]+)/workflows/$',
        SampleWorkflowsEndpoint.as_view(),
        name='sentry-api-0-sample-details-workflows'
        ),

    # TODO: Only use the name process, not workflows
    url(r'^samples/(?P<sample_id>[^\/]+)/processes/$',
        SampleProcessesEndpoint.as_view(),
        name='sentry-api-0-sample-details-processes'
        ),

    url(
        r'^processes/(?P<organization_slug>[^\/]+)/sample-processes/$',
        SampleWorkflowsBatchEndpoint.as_view(),
        name='sentry-api-0-sample-workflows-batch'
    ),

    # Processes and Tasks
    url(
        r'^task-groups/$',
        TaskGroupsEndpoint.as_view(),
        name='clims-api-0-task-groups'
    ),

    url(
        r'^processes/(?P<organization_slug>[^\/]+)/$',
        ProcessesEndpoint.as_view(),
        name='clims-api-0-processes'
    ),

    url(
        r'^process-definitions/(?P<organization_slug>[^\/]+)/$',
        ProcessDefinitionsEndpoint.as_view(),
        name='clims-api-0-process-definitions'
    ),

    url(
        r'^task-types/(?P<organization_slug>[^\/]+)/$',
        TaskTypesEndpoint.as_view(),
        name='clims-api-0-task-types'
    ),

    url(
        r'^user-files/$',
        UserFilesEndpoint.as_view(),
        name='clims-api-0-user-files'
    ),

    # User tasks:
    url(r'^organizations/(?P<organization_slug>[^\/]+)/user-tasks/$',
        UserTaskEndpoint.as_view(),
        name='sentry-api-0-user-task'),
    url(
        r'^user-tasks/(?P<user_task_id>[^\/]+)/files/$',
        UserTaskFilesEndpoint.as_view(),
        name='clims-api-0-user-task-files'
    ),
    url(
        r'^user-tasks/(?P<user_task_id>[^\/]+)/files/(?P<file_id>[^\/]+)/$',
        UserTaskFileDetailsEndpoint.as_view(),
        name='clims-api-0-user-task-file-details'
    ),

    # Plugins
    url(
        r'^plugins/(?P<organization_slug>[^\/]+)/(?P<plugin_id>[^\/]+)/actions/$',
        PluginActionsEndpoint.as_view(),
        name='clims-api-0-plugin-actions'
    ),
    url(
        r'^projects/(?P<organization_slug>[^\/]+)/(?P<project_slug>[^\/]+)/plugins/(?P<plugin_id>[^\/]+)/views/$',
        PluginViewsEndpoint.as_view(),
        name='sentry-api-0-plugin-views'
    ),
)
