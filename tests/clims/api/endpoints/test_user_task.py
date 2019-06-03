
from __future__ import absolute_import

from django.core.urlresolvers import reverse

from sentry.testutils import APITestCase

from clims.models.user_task import UserTask


class UserTaskTest(APITestCase):
    def test_get_user_tasks(self):
        self.org = self.create_organization(owner=self.user, name='baz')
        UserTask.objects.create(name="Test1", organization_id=self.org.id, handler="somehandler")
        url = reverse('sentry-api-0-user-task', kwargs={'organization_slug': self.org.name})

        self.login_as(user=self.user)
        resp = self.client.get(url, format='json')

        assert resp.status_code == 200
        assert resp.data[0].get('handler') == 'somehandler'

    def test_should_not_get_user_task_from_other_org(self):
        self.org = self.create_organization(name='baz')
        url = reverse('sentry-api-0-user-task', kwargs={'organization_slug': self.org.name})

        self.login_as(user=self.user)
        resp = self.client.get(url, format='json')

        assert resp.status_code == 403
