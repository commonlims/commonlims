from __future__ import absolute_import

from sentry.testutils import APITestCase


class InternalQueueTasksListTest(APITestCase):
    def test_anonymous(self):
        # TODO: beacon used to be automatically registered. It seems to have stopped being
        # installed after some refactoring (probably an import that was removed). Decide how and
        # when we want to register it
        from sentry.tasks.beacon import send_beacon  # noqa
        self.login_as(self.user, superuser=True)
        url = '/api/0/internal/queue/tasks/'
        response = self.client.get(url)
        assert response.status_code == 200
        assert 'sentry.tasks.send_beacon' in response.data
