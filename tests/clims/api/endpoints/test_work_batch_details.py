from __future__ import absolute_import

from django.core.urlresolvers import reverse

from sentry.testutils import APITestCase

from clims.services.workbatch import WorkBatchBase
from clims.services.extensible import TextField


class WorkBatchDetailsEndpointTest(APITestCase):
    def setUp(self):
        self.register_extensible(MyWorkbatchImplementation)
        self.has_context()

    def test_get_by_id(self):
        # Arrange
        workbatch = MyWorkbatchImplementation(name='my_workbatch')
        workbatch.kit_type = 'kit type value'
        workbatch.save()

        url = reverse('clims-api-0-work-batch-details',
                      args=(self.organization.name, workbatch.id))
        self.login_as(self.user)

        # Act
        response = self.client.get(url)

        # Assert
        assert response.status_code == 200, response.content
        assert response.data['id'] == workbatch.id
        assert response.data['name'] == 'my_workbatch'
        assert response.data['properties']['kit_type']['value'] == 'kit type value'


class MyWorkbatchImplementation(WorkBatchBase):
    kit_type = TextField(display_name='Kit type')
