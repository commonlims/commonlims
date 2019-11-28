export function ProcessDefinitionField(name) {
  return {
    name,
    type: 'select',
    label: name,
    choices: [name + '-1', name + '-2'],
    help: 'help-' + name,
    required: true,
  };
}

export function ProcessDefinition(id) {
  return {
    id,
    fields: [ProcessDefinitionField('sequencer'), ProcessDefinitionField('sample_type')],
  };
}

export function Preset(name, processDefinitionId, post) {
  return {
    processDefinitionId,
    variables: {
      sequencer: 'sequencer-' + post,
      sample_type: 'sample_type-' + post,
    },
    name,
  };
}

export function ProcessDefinitions() {
  return {
    // TODO: Rename to process => processDefinition
    processDefinitions: [
      ProcessDefinition('ProcessDef1'),
      ProcessDefinition('ProcessDef2'),
    ],
    presets: [Preset('Preset1', 'ProcessDef1', 1), Preset('Preset2', 'ProcessDef2', 2)],
  };
}
