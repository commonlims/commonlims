

from django.conf.urls import include, patterns, url

from .endpoints.organization_dashboards import OrganizationDashboardsEndpoint
from .endpoints.relay_heartbeat import RelayHeartbeatEndpoint
from .endpoints.relay_projectconfigs import RelayProjectConfigsEndpoint
from .endpoints.relay_publickeys import RelayPublicKeysEndpoint
from .endpoints.relay_index import RelayIndexEndpoint
from .endpoints.relay_details import RelayDetailsEndpoint
from .endpoints.relay_register import RelayRegisterChallengeEndpoint, \
    RelayRegisterResponseEndpoint
from .endpoints.api_applications import ApiApplicationsEndpoint
from .endpoints.api_application_details import ApiApplicationDetailsEndpoint
from .endpoints.api_authorizations import ApiAuthorizationsEndpoint
from .endpoints.api_tokens import ApiTokensEndpoint
from .endpoints.assistant import AssistantEndpoint
from .endpoints.auth_index import AuthIndexEndpoint
from .endpoints.authenticator_index import AuthenticatorIndexEndpoint
from .endpoints.broadcast_details import BroadcastDetailsEndpoint
from .endpoints.broadcast_index import BroadcastIndexEndpoint
from .endpoints.catchall import CatchallEndpoint
from .endpoints.chunk import ChunkUploadEndpoint
from .endpoints.index import IndexEndpoint
from .endpoints.internal_queue_tasks import InternalQueueTasksEndpoint
from .endpoints.internal_quotas import InternalQuotasEndpoint
from .endpoints.internal_stats import InternalStatsEndpoint
from .endpoints.monitor_checkins import MonitorCheckInsEndpoint
from .endpoints.monitor_checkin_details import MonitorCheckInDetailsEndpoint
from .endpoints.organization_access_request_details import OrganizationAccessRequestDetailsEndpoint
from .endpoints.organization_auditlogs import OrganizationAuditLogsEndpoint
from .endpoints.organization_api_key_index import OrganizationApiKeyIndexEndpoint
from .endpoints.organization_api_key_details import OrganizationApiKeyDetailsEndpoint
from .endpoints.organization_auth_providers import OrganizationAuthProvidersEndpoint
from .endpoints.organization_auth_provider_details import OrganizationAuthProviderDetailsEndpoint
from .endpoints.organization_auth_provider_send_reminders import OrganizationAuthProviderSendRemindersEndpoint
from .endpoints.organization_avatar import OrganizationAvatarEndpoint
from .endpoints.organization_details import OrganizationDetailsEndpoint
from .endpoints.organization_discover_query import OrganizationDiscoverQueryEndpoint
from .endpoints.organization_discover_saved_queries import OrganizationDiscoverSavedQueriesEndpoint
from .endpoints.organization_discover_saved_query_detail import OrganizationDiscoverSavedQueryDetailEndpoint
from .endpoints.organization_dashboard_details import OrganizationDashboardDetailsEndpoint
from .endpoints.organization_health import OrganizationHealthTopEndpoint, OrganizationHealthGraphEndpoint
from .endpoints.organization_member_details import OrganizationMemberDetailsEndpoint
from .endpoints.organization_member_index import OrganizationMemberIndexEndpoint
from .endpoints.organization_member_team_details import OrganizationMemberTeamDetailsEndpoint
from .endpoints.organization_onboarding_tasks import OrganizationOnboardingTaskEndpoint
from .endpoints.organization_index import OrganizationIndexEndpoint
from .endpoints.organization_plugins import OrganizationPluginsEndpoint
from .endpoints.organization_sentry_apps import OrganizationSentryAppsEndpoint

from .endpoints.organization_users import OrganizationUsersEndpoint
from .endpoints.sentry_app_installations import SentryAppInstallationsEndpoint
from .endpoints.sentry_app_installation_details import SentryAppInstallationDetailsEndpoint
from .endpoints.organization_stats import OrganizationStatsEndpoint
from .endpoints.organization_teams import OrganizationTeamsEndpoint

from .endpoints.prompts_activity import PromptsActivityEndpoint
from .endpoints.filechange import CommitFileChangeEndpoint
from .endpoints.release_deploys import ReleaseDeploysEndpoint
from .endpoints.sentry_apps import SentryAppsEndpoint
from .endpoints.sentry_app_details import SentryAppDetailsEndpoint
from .endpoints.sentry_app_authorizations import SentryAppAuthorizationsEndpoint
from .endpoints.shared_group_details import SharedGroupDetailsEndpoint
from .endpoints.system_health import SystemHealthEndpoint
from .endpoints.system_options import SystemOptionsEndpoint
from .endpoints.team_avatar import TeamAvatarEndpoint
from .endpoints.team_details import TeamDetailsEndpoint
from .endpoints.team_groups_new import TeamGroupsNewEndpoint
from .endpoints.team_groups_trending import TeamGroupsTrendingEndpoint
from .endpoints.team_members import TeamMembersEndpoint
from .endpoints.team_stats import TeamStatsEndpoint
from .endpoints.useravatar import UserAvatarEndpoint
from .endpoints.user_appearance import UserAppearanceEndpoint
from .endpoints.user_authenticator_index import UserAuthenticatorIndexEndpoint
from .endpoints.user_authenticator_enroll import UserAuthenticatorEnrollEndpoint
from .endpoints.user_authenticator_details import UserAuthenticatorDetailsEndpoint
from .endpoints.user_identity_details import UserIdentityDetailsEndpoint
from .endpoints.user_index import UserIndexEndpoint
from .endpoints.user_details import UserDetailsEndpoint
from .endpoints.user_emails import UserEmailsEndpoint
from .endpoints.user_emails_confirm import UserEmailsConfirmEndpoint
from .endpoints.user_ips import UserIPsEndpoint
from .endpoints.user_organizations import UserOrganizationsEndpoint
from .endpoints.user_notification_details import UserNotificationDetailsEndpoint
from .endpoints.user_password import UserPasswordEndpoint
from .endpoints.user_notification_fine_tuning import UserNotificationFineTuningEndpoint
from .endpoints.user_social_identities_index import UserSocialIdentitiesIndexEndpoint
from .endpoints.user_social_identity_details import UserSocialIdentityDetailsEndpoint
from .endpoints.user_subscriptions import UserSubscriptionsEndpoint
from .endpoints.event_file_committers import EventFileCommittersEndpoint
from .endpoints.setup_wizard import SetupWizard


urlpatterns = patterns(
    '',

    # Commmon LIMS urls
    url(
        r'',
        include('clims.api.urls')
    ),

    # Relay
    url(
        r'^relays/$',
        RelayIndexEndpoint.as_view(),
        name='sentry-api-0-relays-index'
    ),

    url(
        r'^relays/register/challenge/$',
        RelayRegisterChallengeEndpoint.as_view(),
        name='sentry-api-0-relay-register-challenge'
    ),

    url(
        r'^relays/register/response/$',
        RelayRegisterResponseEndpoint.as_view(),
        name='sentry-api-0-relay-register-response'
    ),

    url(
        r'^relays/heartbeat/$',
        RelayHeartbeatEndpoint.as_view(),
        name='sentry-api-0-relay-heartbeat'
    ),

    url(
        r'^relays/projectconfigs/$',
        RelayProjectConfigsEndpoint.as_view(),
        name='sentry-api-0-relay-projectconfigs'
    ),

    url(
        r'^relays/publickeys/$',
        RelayPublicKeysEndpoint.as_view(),
        name='sentry-api-0-relay-publickeys'
    ),

    url(
        r'^relays/(?P<relay_id>[^\/]+)/$',
        RelayDetailsEndpoint.as_view(),
        name='sentry-api-0-relays-details'
    ),

    # Api Data
    url(
        r'^assistant/$',
        AssistantEndpoint.as_view(),
        name='sentry-api-0-assistant',
    ),
    url(
        r'^api-applications/$',
        ApiApplicationsEndpoint.as_view(),
        name='sentry-api-0-api-applications'
    ),
    url(
        r'^api-applications/(?P<app_id>[^\/]+)/$',
        ApiApplicationDetailsEndpoint.as_view(),
        name='sentry-api-0-api-application-details'
    ),
    url(
        r'^api-authorizations/$',
        ApiAuthorizationsEndpoint.as_view(),
        name='sentry-api-0-api-authorizations'
    ),
    url(r'^api-tokens/$', ApiTokensEndpoint.as_view(),
        name='sentry-api-0-api-tokens'),
    url(
        r'^promptsactivity/$',
        PromptsActivityEndpoint.as_view(),
        name='sentry-api-0-promptsactivity',
    ),

    # Auth
    url(r'^auth/$', AuthIndexEndpoint.as_view(), name='sentry-api-0-auth'),

    # List Authentiactors
    url(r'^authenticators/$',
        AuthenticatorIndexEndpoint.as_view(),
        name='sentry-api-0-authenticator-index'),

    # Broadcasts
    url(r'^broadcasts/$', BroadcastIndexEndpoint.as_view(),
        name='sentry-api-0-broadcast-index'),
    url(r'^broadcasts/(?P<broadcast_id>[^\/]+)/$', BroadcastDetailsEndpoint.as_view()),

    # Monitors
    url(r'^monitors/(?P<monitor_id>[^\/]+)/checkins/$', MonitorCheckInsEndpoint.as_view()),
    url(r'^monitors/(?P<monitor_id>[^\/]+)/checkins/(?P<checkin_id>[^\/]+)/$',
        MonitorCheckInDetailsEndpoint.as_view()),

    # Users
    url(r'^users/$', UserIndexEndpoint.as_view(), name='sentry-api-0-user-index'),
    url(
        r'^users/(?P<user_id>[^\/]+)/$',
        UserDetailsEndpoint.as_view(),
        name='sentry-api-0-user-details'
    ),
    url(
        r'^users/(?P<user_id>[^\/]+)/avatar/$',
        UserAvatarEndpoint.as_view(),
        name='sentry-api-0-user-avatar'
    ),
    url(
        r'^users/(?P<user_id>[^\/]+)/appearance/$',
        UserAppearanceEndpoint.as_view(),
        name='sentry-api-0-user-appearance'
    ),
    url(
        r'^users/(?P<user_id>[^\/]+)/authenticators/$',
        UserAuthenticatorIndexEndpoint.as_view(),
        name='sentry-api-0-user-authenticator-index'
    ),
    url(
        r'^users/(?P<user_id>[^\/]+)/authenticators/(?P<interface_id>[^\/]+)/enroll/$',
        UserAuthenticatorEnrollEndpoint.as_view(),
        name='sentry-api-0-user-authenticator-enroll'
    ),
    url(
        r'^users/(?P<user_id>[^\/]+)/authenticators/(?P<auth_id>[^\/]+)/(?P<interface_device_id>[^\/]+)/$',
        UserAuthenticatorDetailsEndpoint.as_view(),
        name='sentry-api-0-user-authenticator-device-details'
    ),
    url(
        r'^users/(?P<user_id>[^\/]+)/authenticators/(?P<auth_id>[^\/]+)/$',
        UserAuthenticatorDetailsEndpoint.as_view(),
        name='sentry-api-0-user-authenticator-details'
    ),
    url(
        r'^users/(?P<user_id>[^\/]+)/emails/$',
        UserEmailsEndpoint.as_view(),
        name='sentry-api-0-user-emails'
    ),
    url(
        r'^users/(?P<user_id>[^\/]+)/emails/confirm/$',
        UserEmailsConfirmEndpoint.as_view(),
        name='sentry-api-0-user-emails-confirm'
    ),
    url(
        r'^users/(?P<user_id>[^\/]+)/identities/(?P<identity_id>[^\/]+)/$',
        UserIdentityDetailsEndpoint.as_view(),
        name='sentry-api-0-user-identity-details'
    ),
    url(
        r'^users/(?P<user_id>[^\/]+)/ips/$',
        UserIPsEndpoint.as_view(),
        name='sentry-api-0-user-ips'
    ),
    url(
        r'^users/(?P<user_id>[^\/]+)/organizations/$',
        UserOrganizationsEndpoint.as_view(),
        name='sentry-api-0-user-organizations'
    ),
    url(
        r'^users/(?P<user_id>[^\/]+)/notifications/$',
        UserNotificationDetailsEndpoint.as_view(),
        name='sentry-api-0-user-notifications'
    ),
    url(
        r'^users/(?P<user_id>[^\/]+)/password/$',
        UserPasswordEndpoint.as_view(),
        name='sentry-api-0-user-password'
    ),
    url(
        r'^users/(?P<user_id>[^\/]+)/notifications/(?P<notification_type>[^\/]+)/$',
        UserNotificationFineTuningEndpoint.as_view(),
        name='sentry-api-0-user-notifications-fine-tuning'
    ),
    url(
        r'^users/(?P<user_id>[^\/]+)/social-identities/$',
        UserSocialIdentitiesIndexEndpoint.as_view(),
        name='sentry-api-0-user-social-identities-index'),
    url(
        r'^users/(?P<user_id>[^\/]+)/social-identities/(?P<identity_id>[^\/]+)/$',
        UserSocialIdentityDetailsEndpoint.as_view(),
        name='sentry-api-0-user-social-identity-details'),
    url(
        r'^users/(?P<user_id>[^\/]+)/subscriptions/$',
        UserSubscriptionsEndpoint.as_view(),
        name='sentry-api-0-user-subscriptions'
    ),

    # Organizations

    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/chunk-upload/$',
        ChunkUploadEndpoint.as_view(),
        name='sentry-api-0-chunk-upload'
    ),
    url(
        r'^organizations/$', OrganizationIndexEndpoint.as_view(), name='sentry-api-0-organizations'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/$',
        OrganizationDetailsEndpoint.as_view(),
        name='sentry-api-0-organization-details'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/discover/query/$',
        OrganizationDiscoverQueryEndpoint.as_view(),
        name='sentry-api-0-organization-discover-query'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/discover/saved/$',
        OrganizationDiscoverSavedQueriesEndpoint.as_view(),
        name='sentry-api-0-organization-discover-saved-queries'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/discover/saved/(?P<query_id>[^\/]+)/$',
        OrganizationDiscoverSavedQueryDetailEndpoint.as_view(),
        name='sentry-api-0-organization-discover-saved-query-detail'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/dashboards/(?P<dashboard_id>[^\/]+)/$',
        OrganizationDashboardDetailsEndpoint.as_view(),
        name='sentry-api-0-organization-dashboard-details',
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/dashboards/$',
        OrganizationDashboardsEndpoint.as_view(),
        name='sentry-api-0-organization-dashboards'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/health/top/$',
        OrganizationHealthTopEndpoint.as_view(),
        name='sentry-api-0-organization-health-top',
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/health/graph/$',
        OrganizationHealthGraphEndpoint.as_view(),
        name='sentry-api-0-organization-health-graph',
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/access-requests/$',
        OrganizationAccessRequestDetailsEndpoint.as_view(),
        name='sentry-api-0-organization-access-requests'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/access-requests/(?P<request_id>\d+)/$',
        OrganizationAccessRequestDetailsEndpoint.as_view(),
        name='sentry-api-0-organization-access-request-details'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/api-keys/$',
        OrganizationApiKeyIndexEndpoint.as_view(),
        name='sentry-api-0-organization-api-key-index'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/api-keys/(?P<api_key_id>[^\/]+)/$',
        OrganizationApiKeyDetailsEndpoint.as_view(),
        name='sentry-api-0-organization-api-key-details'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/audit-logs/$',
        OrganizationAuditLogsEndpoint.as_view(),
        name='sentry-api-0-organization-audit-logs'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/auth-provider/$',
        OrganizationAuthProviderDetailsEndpoint.as_view(),
        name='sentry-api-0-organization-auth-provider'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/auth-providers/$',
        OrganizationAuthProvidersEndpoint.as_view(),
        name='sentry-api-0-organization-auth-providers'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/auth-provider/send-reminders/$',
        OrganizationAuthProviderSendRemindersEndpoint.as_view(),
        name='sentry-api-0-organization-auth-provider-send-reminders'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/avatar/$',
        OrganizationAvatarEndpoint.as_view(),
        name='sentry-api-0-organization-avatar'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/members/$',
        OrganizationMemberIndexEndpoint.as_view(),
        name='sentry-api-0-organization-member-index'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/members/(?P<member_id>[^\/]+)/$',
        OrganizationMemberDetailsEndpoint.as_view(),
        name='sentry-api-0-organization-member-details'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/members/(?P<member_id>[^\/]+)/teams/(?P<team_slug>[^\/]+)/$',
        OrganizationMemberTeamDetailsEndpoint.as_view(),
        name='sentry-api-0-organization-member-team-details'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/plugins/$',
        OrganizationPluginsEndpoint.as_view(),
        name='sentry-api-0-organization-plugins'
    ),

    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/releases/(?P<version>[^/]+)/commitfiles/$',
        CommitFileChangeEndpoint.as_view(),
        name='sentry-api-0-release-commitfilechange'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/releases/(?P<version>[^/]+)/deploys/$',
        ReleaseDeploysEndpoint.as_view(),
        name='sentry-api-0-organization-release-deploys'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/users/$',
        OrganizationUsersEndpoint.as_view(),
        name='sentry-api-0-organization-users'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/sentry-app-installations/$',
        SentryAppInstallationsEndpoint.as_view(),
        name='sentry-api-0-sentry-app-installations'
    ),
    url(
        r'^sentry-app-installations/(?P<uuid>[^\/]+)/$',
        SentryAppInstallationDetailsEndpoint.as_view(),
        name='sentry-api-0-sentry-app-installation-details'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/sentry-apps/$',
        OrganizationSentryAppsEndpoint.as_view(),
        name='sentry-api-0-organization-sentry-apps'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/stats/$',
        OrganizationStatsEndpoint.as_view(),
        name='sentry-api-0-organization-stats'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/teams/$',
        OrganizationTeamsEndpoint.as_view(),
        name='sentry-api-0-organization-teams'
    ),
    url(
        r'^organizations/(?P<organization_slug>[^\/]+)/onboarding-tasks/$',
        OrganizationOnboardingTaskEndpoint.as_view(),
        name='sentry-api-0-organization-onboardingtasks'
    ),


    # Teams
    url(
        r'^teams/(?P<organization_slug>[^\/]+)/(?P<team_slug>[^\/]+)/$',
        TeamDetailsEndpoint.as_view(),
        name='sentry-api-0-team-details'
    ),
    url(
        r'^teams/(?P<organization_slug>[^\/]+)/(?P<team_slug>[^\/]+)/(?:issues|groups)/new/$',
        TeamGroupsNewEndpoint.as_view(),
        name='sentry-api-0-team-groups-new'
    ),
    url(
        r'^teams/(?P<organization_slug>[^\/]+)/(?P<team_slug>[^\/]+)/(?:issues|groups)/trending/$',
        TeamGroupsTrendingEndpoint.as_view(),
        name='sentry-api-0-team-groups-trending'
    ),
    url(
        r'^teams/(?P<organization_slug>[^\/]+)/(?P<team_slug>[^\/]+)/members/$',
        TeamMembersEndpoint.as_view(),
        name='sentry-api-0-team-members'
    ),
    url(
        r'^teams/(?P<organization_slug>[^\/]+)/(?P<team_slug>[^\/]+)/stats/$',
        TeamStatsEndpoint.as_view(),
        name='sentry-api-0-team-stats'
    ),
    url(
        r'^teams/(?P<organization_slug>[^\/]+)/(?P<team_slug>[^\/]+)/avatar/$',
        TeamAvatarEndpoint.as_view(),
        name='sentry-api-0-team-avatar'
    ),

    # Projects
    url(
        r'^projects/(?P<organization_slug>[^\/]+)/(?P<project_slug>[^\/]+)/events/(?P<event_id>[\w-]+)/committers/$',
        EventFileCommittersEndpoint.as_view(),
        name='sentry-api-0-event-file-committers'
    ),

    url(
        r'^projects/(?P<organization_slug>[^\/]+)/(?P<project_slug>[^\/]+)/plugins?/',
        include('sentry.plugins.base.project_api_urls')
    ),

    # Load plugin group urls
    url(
        r'^(?:issues|groups)/(?P<issue_id>\d+)/plugins?/',
        include('sentry.plugins.base.group_api_urls')
    ),
    url(
        r'^shared/(?:issues|groups)/(?P<share_id>[^\/]+)/$',
        SharedGroupDetailsEndpoint.as_view(),
        name='sentry-api-0-shared-group-details'
    ),

    # Sentry Apps
    url(
        r'^sentry-apps/$',
        SentryAppsEndpoint.as_view(),
        name='sentry-api-0-sentry-apps'
    ),
    url(
        r'^sentry-apps/(?P<sentry_app_slug>[^\/]+)/$',
        SentryAppDetailsEndpoint.as_view(),
        name='sentry-api-0-sentry-app-details'
    ),

    url(
        r'^sentry-app-installations/(?P<uuid>[^\/]+)/authorizations/$',
        SentryAppAuthorizationsEndpoint.as_view(),
        name='sentry-api-0-sentry-app-authorizations'
    ),

    # Internal
    url(r'^internal/health/$', SystemHealthEndpoint.as_view(),
        name='sentry-api-0-system-health'),
    url(
        r'^internal/options/$', SystemOptionsEndpoint.as_view(), name='sentry-api-0-system-options'
    ),
    url(r'^internal/quotas/$', InternalQuotasEndpoint.as_view()),
    url(r'^internal/queue/tasks/$', InternalQueueTasksEndpoint.as_view()),
    url(r'^internal/stats/$', InternalStatsEndpoint.as_view(),
        name='sentry-api-0-internal-stats'),

    # Project Wizard
    url(
        r'^wizard/$',
        SetupWizard.as_view(),
        name='sentry-api-0-project-wizard-new'
    ),

    url(
        r'^wizard/(?P<wizard_hash>[^\/]+)/$',
        SetupWizard.as_view(),
        name='sentry-api-0-project-wizard'
    ),

    # Catch all
    url(r'^$', IndexEndpoint.as_view(), name='sentry-api-index'),
    url(r'^', CatchallEndpoint.as_view(), name='sentry-api-catchall'),

    # url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
)
