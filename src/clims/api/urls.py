from __future__ import absolute_import, print_function

from django.conf.urls import patterns
from django.conf import urls

from .endpoints.work_batch import WorkBatchEndpoint
from .endpoints.work_batch_details import WorkBatchDetailsEndpoint

from .endpoints.work_definition_details import WorkDefinitionDetailsEndpoint
from .endpoints.events import EventEndpoint

from .endpoints.substance import SubstanceEndpoint
from .endpoints.substance_details import SubstanceDetailsEndpoint
from .endpoints.substance_property import SubstancePropertyEndpoint

from .endpoints.project import ProjectEndpoint
from .endpoints.project_property import ProjectPropertyEndpoint

from .endpoints.container import ContainerEndpoint
from .endpoints.container_property import ContainerPropertyEndpoint
from .endpoints.process_definitions import ProcessDefinitionsEndpoint

from .endpoints.user_files import UserFilesEndpoint

from .endpoints.work_batch_files import WorkBatchFilesEndpoint
from .endpoints.work_batch_file_details import WorkBatchFileDetailsEndpoint

from .endpoints.work_batch_transitions import WorkBatchTransitionsEndpoint

from .endpoints.work_batch_settings import (WorkBatchSettingsEndpoint,
                                            WorkBatchSettingsDetailsEndpoint)

from .endpoints.work_batch_notes import WorkBatchNotesEndpoint
from .endpoints.work_batch_notes_details import WorkBatchNotesDetailsEndpoint

from .endpoints.plugin_actions import PluginActionsEndpoint

from .endpoints.workflow import WorkflowEndpoint
from .endpoints.available_work import AvailableWorkEndpoint
from .endpoints.work_definition import WorkDefinitionsEndpoint
from .endpoints.work_units import WorkUnitsByWorkDefinitionEndpoint

from .endpoints.substance_file import SubstanceFileEndpoint
from .endpoints.substance_file_details import (SubstanceFileDetailsEndpoint,
                                               SubstanceFileDemoDetailsEndpoint
                                               )

from .endpoints.organization_searches import OrganizationSearchesEndpoint

from .endpoints.process_assignments import ProcessAssignmentsEndpoint
from .endpoints.work_units import WorkUnitsEndpoint


def fmt(s):
    """Formats rules with common patterns"""
    s = s.replace('{org}', r'(?P<organization_slug>[^\/]+)')
    return s


def url(endpoint, *args, **kwargs):
    return urls.url(fmt(endpoint), *args, **kwargs)


def url2(pattern, cls):
    # Returns a url when the cls has the name. Will eventually replace url
    return url(pattern, cls.as_view(), name=cls.name)


# TODO: scoping all relevant resources by org id. See CLIMS-469
urlpatterns = patterns(
    '',
    # Workflow
    url2(r'^organizations/{org}/available-work/$', AvailableWorkEndpoint),  # Returns summary
    url2(r'^work-definitions/(?P<work_definition_id>[^\/]+)/$', WorkDefinitionsEndpoint),
    url2(r'^work-definitions/(?P<work_definition_id>[^\/]+)/available-work/$',
        WorkUnitsByWorkDefinitionEndpoint),  # Returns work units

    url(r'^organizations/{org}/workflow/(?P<workflow_endpoint>[^\/]+)/$',
        WorkflowEndpoint.as_view(),
        name='clims-api-0-workflow-root'),
    url(r'^organizations/{org}/process-assignments/$',
        ProcessAssignmentsEndpoint.as_view(),
        name='clims-api-0-process-assignments'),
    url2(r'^organizations/{org}/work-units/$', WorkUnitsEndpoint),
    # Steps
    url(r'^organizations/{org}/work-definition-details/(?P<cls_full_name>[^\/]+)/$',
        WorkDefinitionDetailsEndpoint.as_view(),
        name='clims-api-0-work-definition-details'),
    url(r'^organizations/{org}/events/$',
        EventEndpoint.as_view(),
        name='clims-api-0-events'),

    # Substances
    url(r'^substances/(?P<substance_id>[^\/]+)/$',
        SubstanceDetailsEndpoint.as_view(),
        name='clims-api-0-substance-details'),
    url(r'^organizations/{org}/substances/$',
        SubstanceEndpoint.as_view(),
        name='clims-api-0-substances'),
    url(r'^organizations/{org}/substances/property/(?P<prop>[^\/]+)/$',
        SubstancePropertyEndpoint.as_view(),
        name='clims-api-0-substance-property'),
    url(r'^organizations/{org}/containers/$',
        ContainerEndpoint.as_view(),
        name='clims-api-0-containers'),
    url(r'^organizations/{org}/containers/property/(?P<prop>[^\/]+)/$',
        ContainerPropertyEndpoint.as_view(),
        name='clims-api-0-container-property'),
    url(r'^organizations/{org}/projects/$',
        ProjectEndpoint.as_view(),
        name='clims-api-0-projects'),
    url(r'^organizations/{org}/projects/property/(?P<prop>[^\/]+)/$',
        ProjectPropertyEndpoint.as_view(),
        name='clims-api-0-project-property'),
    url(r'^organizations/{org}/substances/files/$',
        SubstanceFileEndpoint.as_view(),
        name='clims-api-0-organization-substances-files'),
    url(r'^organizations/{org}/substances/files/demo/$',
        SubstanceFileDemoDetailsEndpoint.as_view(),
        name='clims-api-0-organization-substances-files'),
    url(r'^organizations/{org}/substances/files/(?P<file_id>[^\/]+)/$',
        SubstanceFileDetailsEndpoint.as_view(),
        name='clims-api-0-organization-substances-file-details'),

    # work-batches: user task activities that have been grouped together in 1..n sized batches
    url2(r'^organizations/{org}/work-batches/$',
         WorkBatchEndpoint),
    url2(r'^organizations/{org}/work-batches/(?P<work_batch_id>[^\/]+)/transitions/$',
        WorkBatchTransitionsEndpoint),
    url(r'^work-batches/(?P<work_batch_id>[^\/]+)/files/$',
        WorkBatchFilesEndpoint.as_view(),
        name='clims-api-0-user-task-files'),
    url(r'^work-batches/(?P<work_batch_id>[^\/]+)/files/(?P<file_id>[^\/]+)/$',
        WorkBatchFileDetailsEndpoint.as_view(),
        name='clims-api-0-user-task-file-details'),
    url(r'^work-batches/(?P<work_batch_id>[^\/]+)/comments/$',
        WorkBatchNotesEndpoint.as_view(),
        name='clims-api-0-group-notes'),
    url(r'^work-batches/(?P<work_batch_id>[^\/]+)/comments/$(?P<note_id>[^\/]+)/',
        WorkBatchNotesDetailsEndpoint.as_view(),
        name='clims-api-0-group-notes-details'),
    url(r'^work-batch-settings/(?P<organization_slug>[^\/]+)/$',
        WorkBatchSettingsEndpoint.as_view(),
        name='clims-api-0-work-batch-settings'),
    url(r'^work-batch-settings/(?P<work_batch_type>[^\/]+)/$',
        WorkBatchSettingsDetailsEndpoint.as_view(),
        name='clims-api-0-work-batch-settings-details'),

    # Processes and WorkUnits
    url(r'^process-definitions/$',
        ProcessDefinitionsEndpoint.as_view(),
        name='clims-api-0-process-definitions'),
    url(r'^user-files/$',
        UserFilesEndpoint.as_view(),
        name='clims-api-0-user-files'),

    # Work batches:
    url(r'^organizations/{org}/work-batches/$',
        WorkBatchEndpoint.as_view(),
        name='clims-api-0-work-batches'),
    url(r'^organizations/{org}/work-batch-details/(?P<work_batch_id>[^\/]+)/$',
        WorkBatchDetailsEndpoint.as_view(),
        name='clims-api-0-work-batch-details'),
    url(r'^user-tasks/(?P<user_task_id>[^\/]+)/files/$',
        WorkBatchFilesEndpoint.as_view(),
        name='clims-api-0-work-batch-files'),
    url(r'^work-batches/(?P<work_batch_id>[^\/]+)/files/(?P<file_id>[^\/]+)/$',
        WorkBatchFileDetailsEndpoint.as_view(),
        name='clims-api-0-work-batches-file-details'),

    # Plugins
    url(r'^plugins/{org}/(?P<plugin_id>[^\/]+)/actions/$',
        PluginActionsEndpoint.as_view(),
        name='clims-api-0-plugin-actions'),

    # Saved searches
    url(r'^organizations/{org}/saved-searches/$',
        OrganizationSearchesEndpoint.as_view(),
        name='clims-api-0-organization-saved-searches'),
)
