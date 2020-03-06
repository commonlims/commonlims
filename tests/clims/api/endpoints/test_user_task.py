

import pytest
from django.core.urlresolvers import reverse
from sentry.testutils import APITestCase
from clims.models.work_batch import WorkBatch


class WorkBatchTest(APITestCase):
    @pytest.mark.skip("Temporarily skipped")
    def test_get_work_batches(self):
        self.org = self.create_organization(owner=self.user, name='baz')
        WorkBatch.objects.create(name="Test1", organization_id=self.org.id, handler="somehandler")
        url = reverse('clims-api-0-work-batch', kwargs={'organization_slug': self.org.name})

        self.login_as(user=self.user)
        resp = self.client.get(url, format='json')

        assert resp.status_code == 200
        assert resp.data[0].get('handler') == 'somehandler'

    @pytest.mark.skip("Temporarily skipped")
    def test_should_not_get_work_batch_from_other_org(self):
        self.org = self.create_organization(name='baz')
        url = reverse('clims-api-0-work-batch', kwargs={'organization_slug': self.org.name})

        self.login_as(user=self.user)
        resp = self.client.get(url, format='json')

        assert resp.status_code == 403
