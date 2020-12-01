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

    @pytest.mark.testme
    def test_post(self):
        # 1. Start by setting things up. We can just as well use the high level API for that
        sample1 = ExampleSample(name="Sample:{}".format(uuid4()))
        sample1.save()

        cont1 = PandorasBox(name="Container:{}".format(uuid4()))
        cont1["a1"] = sample1
        cont1.save()

        # we can convince ourselves that there's an item in well a1 by printing out the details
        # Note that print(cont1) doesn't print out this "picture"
        print(cont1.to_string())

        # 2. We must have a container to push into. The UI would know about this container
        # in a workbatch (it's one of the target containers, which must exist)

        cont2 = PandorasBox(name="Container:{}".format(uuid4()))
        cont2.save()

        workbatch = ExampleWorkBatch(name="WorkBatch:{}".format(uuid4()))
        workbatch.save()
        print(workbatch.id)

        url = reverse(WorkBatchTransitionsEndpoint.name, args=(cont1.organization.name, workbatch.id))

        self.login_as(self.user)

        # TODO: Here is a change in what we talked about. I think we should have the payload a list
        # as we will almost certainly want that very soon too (e.g. when we're moving all items
        # between containers 1-1, we're going to want that to happen in one call)
        payload = [
            {
                "type": "move",
                "source_position": {
                        "container_id": cont1.id,
                        "index": "a1"
                },
                "target_position": {
                    "container_id": cont2.id,
                    "index": "b2"
                },
            },
            {
                "type": "move",
                "source_position": {
                        "container_id": cont1.id,
                        "index": "c1"
                },
                "target_position": {
                    "container_id": cont2.id,
                    "index": "c2"
                },
            }
        ]

        # Act
        response = self.client.post(
            path=url,
            data=json.dumps(payload),
            content_type='application/json',
        )
        assert response.status_code == status.HTTP_201_CREATED
