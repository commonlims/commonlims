

from django.utils import timezone

from sentry.models import FeatureAdoption, GroupTombstone, Rule
from sentry.plugins import IssueTrackingPlugin2, NotificationPlugin
from sentry.signals import (
    alert_rule_created,
    first_event_received,
    project_created,
    member_joined,
    plugin_enabled,
    user_feedback_received,
    issue_assigned,
    issue_resolved_in_release,
    advanced_search,
    save_search_created,
    inbound_filter_toggled,
    sso_enabled,
    data_scrubber_enabled,
)
from sentry.receivers.rules import DEFAULT_RULE_DATA
from sentry.testutils import TestCase


class FeatureAdoptionTest(TestCase):
    def setUp(self):
        super(FeatureAdoptionTest, self).setUp()
        self.now = timezone.now().replace(microsecond=0)
        self.owner = self.create_user()
        self.organization = self.create_organization(owner=self.owner)
        self.team = self.create_team(organization=self.organization)
        self.project = self.create_project(teams=[self.team])

    def test_bad_feature_slug(self):
        FeatureAdoption.objects.record(self.organization.id, "xxx")
        feature_complete = FeatureAdoption.objects.get_by_slug(
            organization=self.organization, slug="first_event"
        )
        assert feature_complete is None

    def test_first_event(self):
        group = self.create_group(
            project=self.project, platform='javascript', message='javascript error message'
        )
        first_event_received.send(project=self.project, group=group, sender=type(self.project))

        first_event = FeatureAdoption.objects.get_by_slug(
            organization=self.organization, slug="first_event"
        )
        assert first_event.complete

    def test_user_feedback(self):
        user_feedback_received.send(project=self.project, sender=type(self.project))

        feature_complete = FeatureAdoption.objects.get_by_slug(
            organization=self.organization, slug="user_feedback"
        )
        assert feature_complete

    def test_project_created(self):
        project_created.send(project=self.project, user=self.owner, sender=type(self.project))
        feature_complete = FeatureAdoption.objects.get_by_slug(
            organization=self.organization, slug="first_project"
        )
        assert feature_complete

    def test_member_joined(self):
        member = self.create_member(
            organization=self.organization, teams=[self.team], user=self.create_user()
        )
        member_joined.send(member=member, organization=self.organization, sender=type(self.project))
        feature_complete = FeatureAdoption.objects.get_by_slug(
            organization=self.organization, slug="invite_team"
        )
        assert feature_complete

    def test_assignment(self):
        issue_assigned.send(
            project=self.project,
            group=self.group,
            user=self.user,
            sender='something')
        feature_complete = FeatureAdoption.objects.get_by_slug(
            organization=self.organization, slug="assignment"
        )
        assert feature_complete

    def test_resolved_in_release(self):
        issue_resolved_in_release.send(
            project=self.project,
            group=self.group,
            user=self.user,
            resolution_type='now',
            sender=type(
                self.project))
        feature_complete = FeatureAdoption.objects.get_by_slug(
            organization=self.organization, slug="resolved_in_release"
        )
        assert feature_complete

    def test_advanced_search(self):
        advanced_search.send(project=self.project, sender=type(self.project))
        feature_complete = FeatureAdoption.objects.get_by_slug(
            organization=self.organization, slug="advanced_search"
        )
        assert feature_complete

    def test_save_search(self):
        save_search_created.send(project=self.project, user=self.user, sender=type(self.project))
        feature_complete = FeatureAdoption.objects.get_by_slug(
            organization=self.organization, slug="saved_search"
        )
        assert feature_complete

    def test_inbound_filters(self):
        inbound_filter_toggled.send(project=self.project, sender=type(self.project))
        feature_complete = FeatureAdoption.objects.get_by_slug(
            organization=self.organization, slug="inbound_filters"
        )
        assert feature_complete

    def test_alert_rules(self):
        rule = Rule.objects.create(
            project=self.project, label="Trivially modified rule", data=DEFAULT_RULE_DATA
        )

        alert_rule_created.send(
            user=self.owner,
            project=self.project,
            rule=rule,
            sender=type(
                self.project))
        feature_complete = FeatureAdoption.objects.get_by_slug(
            organization=self.organization, slug="alert_rules"
        )
        assert feature_complete

    def test_issue_tracker_plugin(self):
        plugin_enabled.send(
            plugin=IssueTrackingPlugin2(),
            project=self.project,
            user=self.owner,
            sender=type(self.project)
        )
        feature_complete = FeatureAdoption.objects.get_by_slug(
            organization=self.organization, slug="issue_tracker_integration"
        )
        assert feature_complete

    def test_notification_plugin(self):
        plugin_enabled.send(
            plugin=NotificationPlugin(),
            project=self.project,
            user=self.owner,
            sender=type(self.project)
        )
        feature_complete = FeatureAdoption.objects.get_by_slug(
            organization=self.organization, slug="notification_integration"
        )
        assert feature_complete

    def test_sso(self):
        sso_enabled.send(
            organization=self.organization,
            user=self.user,
            provider='google',
            sender=type(
                self.organization))
        feature_complete = FeatureAdoption.objects.get_by_slug(
            organization=self.organization, slug="sso"
        )
        assert feature_complete

    def test_data_scrubber(self):
        data_scrubber_enabled.send(organization=self.organization, sender=type(self.organization))
        feature_complete = FeatureAdoption.objects.get_by_slug(
            organization=self.organization, slug="data_scrubbers"
        )
        assert feature_complete

    def test_delete_and_discard(self):
        GroupTombstone.objects.create(
            previous_group_id=self.group.id,
            project=self.project,
        )
        feature_complete = FeatureAdoption.objects.get_by_slug(
            organization=self.organization, slug="delete_and_discard"
        )
        assert feature_complete
