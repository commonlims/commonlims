from __future__ import absolute_import
from sentry.testutils import APITestCase
from django.core.urlresolvers import reverse
from clims.plugins.demo.dnaseq.models import PandorasBox, ExampleSample, ExampleWorkBatch
from uuid import uuid4
from clims.api.endpoints.work_batch_transitions import WorkBatchTransitionsEndpoint
from rest_framework import status
import json
import pytest


class TestWorkBatchTransitions(APITestCase):
    def setUp(self):
        self.has_context()

        # so we can use the domain classes defined in the demo plugin, e.g. StuffoMagico
        self.install_main_demo_plugin()

    # TODO: Add a DELETE method too. It will be used when
    # the frontend component needs to cancel some of those
    # transitions. It will also have to remove the sample
    # from the container it created. Note that if the user
    # goes back and forths with this a lot it can generate
    # a significant amount of data, so such samples should
    # be soft deleted too so they can be removed in a cleanup
    # job if users want that.
    @pytest.mark.xfail
    def test_delete(self):
        raise NotImplementedError()

    def bootstrap(self):
        self.sample1 = ExampleSample(name="Sample:{}".format(uuid4()))
        self.sample1.save()

        self.cont1 = PandorasBox(name="Container:{}".format(uuid4()))
        self.cont1["a1"] = self.sample1
        self.cont1.save()

        self.cont2 = PandorasBox(name="Container:{}".format(uuid4()))
        self.cont2.save()

        self.workbatch = ExampleWorkBatch(name="WorkBatch:{}".format(uuid4()))
        self.workbatch.save()

        self.url = reverse(WorkBatchTransitionsEndpoint.name, args=(self.cont1.organization.name, self.workbatch.id))
        self.login_as(self.user)

    def test_post(self):
        self.bootstrap()

        payload = {
            "transitions": [
                {
                    "type": "move",
                    "source_position": {
                            "container_id": self.cont1.id,
                            "index": "a1"
                    },
                    "target_position": {
                        "container_id": self.cont2.id,
                        "index": "b2"
                    },
                }
            ]
        }

        response = self.client.post(
            path=self.url,
            data=json.dumps(payload),
            content_type='application/json',
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_post__invalid(self):
        self.bootstrap()

        payload = {
            "transitions": [
                {
                    "type": "move",
                    "source_position": {
                            "container_id": self.cont1.id,
                            "index": "z100"
                    },
                    "target_position": {
                        "container_id": self.cont2.id,
                        "index": "b2"
                    },
                }
            ]
        }

        response = self.client.post(
            path=self.url,
            data=json.dumps(payload),
            content_type='application/json',
        )

        # TODO: this should be HTTP_400_BAD_REQUEST
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

    def test_post__invalid_source_substance(self):
        self.bootstrap()

        payload = {
            "transitions": [
                {
                    "type": "move",
                    "source_position": {
                            "container_id": self.cont1.id,
                            "index": "c1"
                    },
                    "target_position": {
                        "container_id": self.cont2.id,
                        "index": "c2"
                    },
                }
            ]
        }

        response = self.client.post(
            path=self.url,
            data=json.dumps(payload),
            content_type='application/json',
        )
        # TODO: this should be HTTP_400_BAD_REQUEST
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
