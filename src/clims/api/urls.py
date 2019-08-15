from __future__ import absolute_import, print_function

from django.conf.urls import patterns, url

from .endpoints.work_batch import WorkBatchEndpoint, WorkBatchDetailsEndpoint, WorkBatchDetailsActivityEndpoint

from .endpoints.sample import SampleEndpoint, SampleBatchEndpoint
from .endpoints.samples_details import SampleDetailsEndpoint, SampleWorkflowsEndpoint, SampleProcessesEndpoint, SampleWorkflowsBatchEndpoint

from .endpoints.processes import ProcessesEndpoint, TaskGroupsEndpoint
from .endpoints.process_definitions import ProcessDefinitionsEndpoint

from .endpoints.task_types import TaskTypesEndpoint

from .endpoints.user_files import UserFilesEndpoint

from .endpoints.work_batch_files import WorkBatchFilesEndpoint
from .endpoints.work_batch_file_details import WorkBatchFileDetailsEndpoint

from .endpoints.work_batch_settings import WorkBatchSettingsEndpoint, WorkBatchSettingsDetailsEndpoint

from .endpoints.work_batch_notes import WorkBatchNotesEndpoint
from .endpoints.work_batch_notes_details import WorkBatchNotesDetailsEndpoint

from .endpoints.plugin_actions import PluginActionsEndpoint
from .endpoints.plugin_views import PluginViewsEndpoint

urlpatterns = patterns(
    # Samples: TODO: have them per organization (that is in projects that are per organization)
    # TODO: Should be items
    url(r'^samples/$', SampleEndpoint.as_view(), name='clims-api-0-samples'),
    url(r'^samples/(?P<sample_id>[^\/]+)/$',
        SampleDetailsEndpoint.as_view(),
        name='clims-api-0-sample-details'
        ),

    # USER TASKS
    url(r'^organizations/(?P<organization_slug>[^\/]+)/work-batches/$',
        WorkBatchEndpoint.as_view(),
        name='clims-api-0-user-task'),
    url(
        r'^work-batches/(?P<work_batch_id>[^\/]+)/files/$',
        WorkBatchFilesEndpoint.as_view(),
        name='clims-api-0-user-task-files'
    ),
    url(
        r'^work-batches/(?P<work_batch_id>[^\/]+)/files/(?P<file_id>[^\/]+)/$',
        WorkBatchFileDetailsEndpoint.as_view(),
        name='clims-api-0-user-task-file-details'
    ),

    url(r'^work-batches/(?P<user_task_id>[^\/]+)/activity/$',
        WorkBatchDetailsActivityEndpoint.as_view(),
        name='clims-api-0-work-batches-details-activity'),

    url(r'^work-batches/(?P<work_batch_id>[^\/]+)/$',
        WorkBatchDetailsEndpoint.as_view(),
        name='clims-api-0-work-batch-details'),

    url(
        r'^work-batches/(?P<work_batch_id>[^\/]+)/comments/$',
        WorkBatchNotesEndpoint.as_view(),
        name='clims-api-0-group-notes'
    ),
    url(
        r'^work-batches/(?P<work_batch_id>[^\/]+)/comments/$(?P<note_id>[^\/]+)/',
        WorkBatchNotesDetailsEndpoint.as_view(),
        name='clims-api-0-group-notes-details'
    ),

    url(r'^work-batch-settings/(?P<organization_slug>[^\/]+)/$',
        WorkBatchSettingsEndpoint.as_view(),
        name='clims-api-0-work-batch-settings'),

    url(r'^work-batch-settings/(?P<work_batch_type>[^\/]+)/$',
        WorkBatchSettingsDetailsEndpoint.as_view(),
        name='clims-api-0-work-batch-settings-details'),

    url(r'^sample-batches/$', SampleBatchEndpoint.as_view(), name='clims-api-0-sample-batches'),

    # Sample level workflows for this sample
    url(r'^samples/(?P<sample_id>[^\/]+)/workflows/$',
        SampleWorkflowsEndpoint.as_view(),
        name='clims-api-0-sample-details-workflows'
        ),

    # Sample level workflows for this sample
    url(r'^samples/(?P<sample_id>[^\/]+)/workflows/$',
        SampleWorkflowsEndpoint.as_view(),
        name='clims-api-0-sample-details-workflows'
        ),

    # TODO: Only use the name process, not workflows
    url(r'^samples/(?P<sample_id>[^\/]+)/processes/$',
        SampleProcessesEndpoint.as_view(),
        name='clims-api-0-sample-details-processes'
        ),

    url(
        r'^processes/(?P<organization_slug>[^\/]+)/sample-processes/$',
        SampleWorkflowsBatchEndpoint.as_view(),
        name='clims-api-0-sample-workflows-batch'
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

    # Work batches:
    url(r'^organizations/(?P<organization_slug>[^\/]+)/work-batches/$',
        WorkBatchEndpoint.as_view(),
        name='sentry-api-0-work-batches'),
    url(
        r'^user-tasks/(?P<user_task_id>[^\/]+)/files/$',
        WorkBatchFilesEndpoint.as_view(),
        name='clims-api-0-work-batch-files'
    ),
    url(
        r'^work-batches/(?P<work_batch_id>[^\/]+)/files/(?P<file_id>[^\/]+)/$',
        WorkBatchFileDetailsEndpoint.as_view(),
        name='clims-api-0-work-batches-file-details'
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
        name='clims-api-0-plugin-views'
    ),
)
