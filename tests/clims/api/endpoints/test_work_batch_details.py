from __future__ import absolute_import

import pytest
import json
from django.core.urlresolvers import reverse
from rest_framework import status

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

    def test_put__update_property(self):
        # Arrange
        workbatch = MyWorkbatchImplementation(name='my_workbatch')
        workbatch.kit_type = 'kit type value'
        workbatch.save()

        url = reverse('clims-api-0-work-batch-details',
                      args=(self.organization.name, workbatch.id))
        self.login_as(self.user)
        payload = {
            'properties': {
                'kit_type': {
                    'value': 'updated kit type'
                }
            }
        }

        # Act
        response = self.client.put(
            path=url,
            data=json.dumps(payload),
            content_type='application/json',
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK, response.data
        fetched_workbatch = self.app.workbatches.get(id=workbatch.id)
        assert fetched_workbatch.kit_type == 'updated kit type'

    @pytest.mark.dev_edvard
    def test_initialize_property__then_delete_it(self):
        # Arrange
        workbatch = MyWorkbatchImplementation(name='my_workbatch')
        workbatch.kit_type = 'kit type value'
        workbatch.save()

        url = reverse('clims-api-0-work-batch-details',
                      args=(self.organization.name, workbatch.id))
        self.login_as(self.user)
        payload = {
            'properties': {
                'kit_type': {
                    'value': None
                }
            }
        }

        # Act
        response = self.client.put(
            path=url,
            data=json.dumps(payload),
            content_type='application/json',
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK, response.data
        fetched_workbatch = self.app.workbatches.get(id=workbatch.id)
        assert fetched_workbatch.kit_type is None


class MyWorkbatchImplementation(WorkBatchBase):
    kit_type = TextField(display_name='Kit type')
