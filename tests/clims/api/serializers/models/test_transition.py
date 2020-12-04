from __future__ import absolute_import

from sentry.testutils import TestCase
from clims.api.serializers.models.transition import TransitionBatchSerializer


class TransitionSerializerTest(TestCase):
    def test_can_validate_transition(self):
        valid_payload = {
            "transitions": [{
                "source_position": {"container_id": 1, "index": "B:1"},
                "target_position": {"container_id": 1, "index": "A:1"},
                "type": "move"}
            ]}
        validator = TransitionBatchSerializer(data=valid_payload)
        assert validator.is_valid()

    def test_can_validate_invalid_transition(self):
        invalid_payload = {
            "transitions": [{
                "source_position": {"container_id": 1},
                "target_position": {"container_id": 1, "index": "A:1"},
                "type": "move"}
            ]}
        validator = TransitionBatchSerializer(data=invalid_payload)
        assert not validator.is_valid()
