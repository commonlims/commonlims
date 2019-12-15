from __future__ import absolute_import

from sentry.api.fields.actor import Actor
from sentry.digests.utilities import (
    team_actors_to_user_ids,
)
from sentry.models import OrganizationMemberTeam, Team
from sentry.testutils import TestCase


def sort_records(records):
    """
    Sorts records for fetch_state method
    fetch_state is expecting these records to be ordered from newest to oldest
    """
    return sorted(records, key=lambda r: r.value.event.datetime, reverse=True)


class UtilitiesHelpersTestCase(TestCase):
    def test_team_actors_to_user_ids(self):
        team1 = self.create_team()
        team2 = self.create_team()
        team3 = self.create_team()  # team with no active members
        users = [self.create_user() for i in range(0, 8)]

        self.create_member(user=users[0], organization=self.organization, teams=[team1])
        self.create_member(user=users[1], organization=self.organization, teams=[team1])
        self.create_member(user=users[2], organization=self.organization, teams=[team1])
        self.create_member(user=users[3], organization=self.organization, teams=[team1, team2])
        self.create_member(user=users[4], organization=self.organization, teams=[team2, self.team])
        self.create_member(user=users[5], organization=self.organization, teams=[team2])

        # Inactive member
        member6 = self.create_member(
            user=users[6],
            organization=self.organization,
            teams=[
                team2,
                team3])
        team_member6 = OrganizationMemberTeam.objects.filter(organizationmember_id=member6.id)
        for team_member in team_member6:
            team_member.update(is_active=False)
        # Member without teams
        self.create_member(user=users[7], organization=self.organization, teams=[])

        team_actors = [Actor(team1.id, Team), Actor(team2.id, Team), Actor(team3.id, Team)]
        user_ids = [user.id for user in users]

        assert team_actors_to_user_ids(team_actors, user_ids) == {
            team1.id: set([users[0].id, users[1].id, users[2].id, users[3].id]),
            team2.id: set([users[3].id, users[4].id, users[5].id]),
        }
