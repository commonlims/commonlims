from __future__ import absolute_import

# TODO: Should we have a namespace from which plugin developers should import
# (e.g. only clims.plugins)?

from clims.services.workflow.camunda import CamundaWorkflow
from clims.services import TextField

SAMPLE_TYPES = ['DNA', 'RNA']
PREP_METHODS = ['microwave', 'mixer']
SEQUENCERS = ['iPhone', 'Android', 'Bang & Olufsen']


class SequenceSimple(CamundaWorkflow):
    """
    Sequence a sample.

    Note that since this is a `CamundaWorkflow`, the flow of the workflow is described in
    a file with the same name as the class but the .bpmn extension. This class acts as glue between
    the visual workflow definition and the data entry views that are required for completing the
    workflow.
    """

    sequencer = TextField(choices=SEQUENCERS,
                          help='Instrument where the sample will be sequenced',
                          required=True,
                          display_name='Sequencer')

    sample_prep = TextField(choices=PREP_METHODS,
                            help='The method used for preparing the sample',
                            required=True,
                            display_name='Sample prep')

    sample_type = TextField(choices=SAMPLE_TYPES,
                            help='The type of the sample',
                            required=True,
                            display_name='Sample type')

    # TODO-simple: One should be able to have this show at the bottom in the UI.
    # Add a sort parameter to the field and sort by it in the UI
    comment = TextField(display_name='Comment', multiline=True)

    # Presets allow the plugin developer to define a named set of variables for a workflow process
    # This can make it easier for users to start processes that have a complex set of variables.
    # They can either be defined with a dictionary on the class like this

    # presets = {
    #    'NovaSeq Ready-made libraries': {
    #        sample_prep: 'Ready-made libraries',
    #        sequencer: 'NovaSeq',
    #        sample_type: 'Unknown',
    # }

    # or, for flexibility, they can be defined as a method instead, which may make
    # complex presets easy to define. Here we go for the latter approach. Check out the
    # test in tests/clims/plugins/demo/dnaseq/workflows/test_sequence.py to see the equivalent
    # dictionary.

    def presets(self):
        # The Android handles all samples and we can use all prep methods
        self.preset("{sequencer}: {sample_type} prepared with {sample_prep}",
                    sample_prep=PREP_METHODS,
                    sample_type=SAMPLE_TYPES,
                    sequencer=["Android"])

        # The other sequencers can handle DNA. In this case we prepare the samples in a microwave
        self.preset("{sequencer}: {sample_type} prepared with {sample_prep}",
                    sample_prep="microwave",
                    sample_type="DNA",
                    sequencer=set(SEQUENCERS) - {"Android"})


class QualityControlSimple(CamundaWorkflow):
    """
    A subworkflow in the Sequence workflow (take a look at Sequence.bpmn to see how it's used)
    """
    pass
