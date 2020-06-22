export const PROCESS_DEFINITIONS_GET_REQUEST = 'PROCESS_DEFINITIONS_GET_REQUEST';
export const processDefinitionsGetRequest = () => {
  return {
    type: PROCESS_DEFINITIONS_GET_REQUEST,
  };
};

export const PROCESS_DEFINITIONS_GET_SUCCESS = 'PROCESS_DEFINITIONS_GET_SUCCESS';
export const processDefinitionsGetSuccess = (processDefinitions) => {
  return {
    type: PROCESS_DEFINITIONS_GET_SUCCESS,
    processDefinitions,
  };
};

export const PROCESS_DEFINITIONS_GET_FAILURE = 'PROCESS_DEFINITIONS_GET_FAILURE';
export const processDefinitionsGetFailure = (err) => ({
  type: PROCESS_DEFINITIONS_GET_FAILURE,
  errorMessage: err,
});

export const processDefinitionsGet = () => (dispatch) => {
  dispatch(processDefinitionsGetRequest());
  const data = {
    processDefinitions: [
      {
        id: 'Sequence',
        fields: [
          {
            name: 'sequencer',
            type: 'select',
            label: 'Sequencer',
            choices: ['HiSeq 2500', 'Hiseq', 'iSeq', 'MiSeq', 'NovaSeq'],
            help: 'Instrument where the sample will be sequenced',
            required: true,
          },
          {
            name: 'sample_prep',
            type: 'select',
            label: 'Sample prep',
            disabled: false,
            help: 'The method used for preparing the sample',
            choices: ['Ready-made libraries', 'In-house libraries'],
            required: true,
          },
          {
            name: 'sample_type',
            type: 'select',
            label: 'Sample type',
            choices: ['DNA', 'RNA', 'mRNA'],
            help: 'The type of the sample',
            required: true,
          },
          {
            name: 'prep_kit',
            type: 'select',
            label: 'Prep kit',
            choices: [
              'ThruPLEX',
              'TruSeq Methylation',
              'TruSeq Nano',
              'TruSeq PCR-free',
              'TruSeq Stranded Total RNA',
              'TruSeq Stranded mRNA',
            ],
            help: 'Which preparation type should be used',
            required: true,
          },
        ],
      },
      {
        id: 'SNP',
        fields: [
          {
            name: 'instrument',
            type: 'select',
            label: 'Instrument',
            choices: ['Instrument A', 'Instrument B'],
            help: 'Instrument where X will happen',
            required: true,
          },
        ],
      },
    ],
    presets: [
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'Unknown',
          sample_prep: 'Ready-made libraries',
          sequencer: 'NovaSeq',
          sample_type: 'Unknown',
        },
        name: 'NovaSeq Ready-made libraries',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'Unknown',
          sample_prep: 'Ready-made libraries',
          sequencer: 'Hiseq',
          sample_type: 'Unknown',
        },
        name: 'Hiseq Ready-made libraries',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'Unknown',
          sample_prep: 'Ready-made libraries',
          sequencer: 'iSeq',
          sample_type: 'Unknown',
        },
        name: 'iSeq Ready-made libraries',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'Unknown',
          sample_prep: 'Ready-made libraries',
          sequencer: 'HiSeq 2500',
          sample_type: 'Unknown',
        },
        name: 'HiSeq 2500 Ready-made libraries',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'Unknown',
          sample_prep: 'Ready-made libraries',
          sequencer: 'MiSeq',
          sample_type: 'Unknown',
        },
        name: 'MiSeq Ready-made libraries',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'ThruPLEX',
          sample_prep: 'In-house libraries',
          sequencer: 'NovaSeq',
          sample_type: 'DNA',
        },
        name: 'NovaSeq ThruPLEX',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'ThruPLEX',
          sample_prep: 'In-house libraries',
          sequencer: 'HiSeq 2500',
          sample_type: 'DNA',
        },
        name: 'HiSeq 2500 ThruPLEX',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'ThruPLEX',
          sample_prep: 'In-house libraries',
          sequencer: 'Hiseq',
          sample_type: 'DNA',
        },
        name: 'Hiseq ThruPLEX',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'ThruPLEX',
          sample_prep: 'In-house libraries',
          sequencer: 'MiSeq',
          sample_type: 'DNA',
        },
        name: 'MiSeq ThruPLEX',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'TruSeq Methylation',
          sample_prep: 'In-house libraries',
          sequencer: 'NovaSeq',
          sample_type: 'DNA',
        },
        name: 'NovaSeq TruSeq Methylation',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'TruSeq Methylation',
          sample_prep: 'In-house libraries',
          sequencer: 'Hiseq',
          sample_type: 'DNA',
        },
        name: 'Hiseq TruSeq Methylation',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'TruSeq Methylation',
          sample_prep: 'In-house libraries',
          sequencer: 'HiSeq 2500',
          sample_type: 'DNA',
        },
        name: 'HiSeq 2500 TruSeq Methylation',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'TruSeq Nano',
          sample_prep: 'In-house libraries',
          sequencer: 'NovaSeq',
          sample_type: 'DNA',
        },
        name: 'NovaSeq TruSeq Nano',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'TruSeq Nano',
          sample_prep: 'In-house libraries',
          sequencer: 'Hiseq',
          sample_type: 'DNA',
        },
        name: 'Hiseq TruSeq Nano',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'TruSeq Nano',
          sample_prep: 'In-house libraries',
          sequencer: 'HiSeq 2500',
          sample_type: 'DNA',
        },
        name: 'HiSeq 2500 TruSeq Nano',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'TruSeq Nano',
          sample_prep: 'In-house libraries',
          sequencer: 'MiSeq',
          sample_type: 'DNA',
        },
        name: 'MiSeq TruSeq Nano',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'TruSeq PCR-free',
          sample_prep: 'In-house libraries',
          sequencer: 'NovaSeq',
          sample_type: 'DNA',
        },
        name: 'NovaSeq TruSeq PCR-free',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'TruSeq PCR-free',
          sample_prep: 'In-house libraries',
          sequencer: 'Hiseq',
          sample_type: 'DNA',
        },
        name: 'Hiseq TruSeq PCR-free',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'TruSeq PCR-free',
          sample_prep: 'In-house libraries',
          sequencer: 'HiSeq 2500',
          sample_type: 'DNA',
        },
        name: 'HiSeq 2500 TruSeq PCR-free',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'TruSeq PCR-free',
          sample_prep: 'In-house libraries',
          sequencer: 'MiSeq',
          sample_type: 'DNA',
        },
        name: 'MiSeq TruSeq PCR-free',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'TruSeq Stranded Total RNA',
          sample_prep: 'In-house libraries',
          sequencer: 'NovaSeq',
          sample_type: 'RNA',
        },
        name: 'NovaSeq TruSeq Stranded Total RNA',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'TruSeq Stranded Total RNA',
          sample_prep: 'In-house libraries',
          sequencer: 'HiSeq 2500',
          sample_type: 'RNA',
        },
        name: 'HiSeq 2500 TruSeq Stranded Total RNA',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'TruSeq Stranded Total RNA',
          sample_prep: 'In-house libraries',
          sequencer: 'MiSeq',
          sample_type: 'RNA',
        },
        name: 'MiSeq TruSeq Stranded Total RNA',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'TruSeq Stranded mRNA',
          sample_prep: 'In-house libraries',
          sequencer: 'NovaSeq',
          sample_type: 'mRNA',
        },
        name: 'NovaSeq TruSeq Stranded mRNA',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'TruSeq Stranded mRNA',
          sample_prep: 'In-house libraries',
          sequencer: 'HiSeq 2500',
          sample_type: 'mRNA',
        },
        name: 'HiSeq 2500 TruSeq Stranded mRNA',
      },
      {
        processDefinitionId: 'Sequence',
        variables: {
          prep_kit: 'TruSeq Stranded mRNA',
          sample_prep: 'In-house libraries',
          sequencer: 'MiSeq',
          sample_type: 'mRNA',
        },
        name: 'MiSeq TruSeq Stranded mRNA',
      },
    ],
  };

  dispatch(processDefinitionsGetSuccess(data));
};
