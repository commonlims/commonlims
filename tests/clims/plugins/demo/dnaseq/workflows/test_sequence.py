from __future__ import absolute_import

from sentry.testutils import TestCase
from clims.plugins.demo.dnaseq.workflows.sequence import SequenceSimple


class TestSimpleWorkflow(TestCase):
    def test_defines_expected_presets(self):
        workflow = SequenceSimple()
        presets = workflow.get_presets()

        expected = {
            'Android: DNA prepared with microwave': {
                'sample_prep': 'microwave',
                'sequencer': 'Android',
                'sample_type': 'DNA'
            },
            'Android: DNA prepared with mixer': {
                'sample_prep': 'mixer',
                'sequencer': 'Android',
                'sample_type': 'DNA'
            },
            'iPhone: DNA prepared with microwave': {
                'sample_prep': 'microwave',
                'sample_type': 'DNA',
                'sequencer': 'iPhone'
            },
            'Android: RNA prepared with microwave': {
                'sample_prep': 'microwave',
                'sequencer': 'Android',
                'sample_type': 'RNA'
            },
            'Bang & Olufsen: DNA prepared with microwave': {
                'sample_prep': 'microwave',
                'sample_type': 'DNA',
                'sequencer': 'Bang & Olufsen'
            },
            'Android: RNA prepared with mixer': {
                'sample_prep': 'mixer',
                'sequencer': 'Android',
                'sample_type': 'RNA'
            }
        }

        assert presets == expected
