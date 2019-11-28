import processDefinition, {initialState} from 'app/redux/reducers/processDefinition';

const processDefinitionsResponse = TestStubs.ProcessDefinitions();

function atStart() {
  return processDefinition(undefined, {});
}

function afterGetRequest() {
  return processDefinition(atStart(), {
    type: 'PROCESS_DEFINITIONS_GET_REQUEST',
  });
}

function afterGetSuccess() {
  return processDefinition(afterGetRequest(), {
    type: 'PROCESS_DEFINITIONS_GET_SUCCESS',
    processDefinitions: processDefinitionsResponse,
  });
}

function afterGetFailure() {
  return processDefinition(afterGetRequest(), {
    type: 'PROCESS_DEFINITIONS_GET_FAILURE',
    processDefinitions: processDefinitionsResponse,
    errorMessage: 'oops',
  });
}

describe('processDefinition reducer', () => {
  it('should handle initial state', () => {
    const state = atStart();
    expect(state).toEqual(initialState);
    expect(state.loading).toEqual(false);
    expect(state.errorMessage).toEqual(null);
  });

  it('switch to loading when request starts', () => {
    const state = afterGetRequest();
    expect(state.loading).toEqual(true);
    expect(state.errorMessage).toEqual(null);
  });

  it('should handle getting processDefinitions and presets', () => {
    const state = afterGetSuccess();
    expect(state.loading).toEqual(false);
    expect(Object.keys(state.processDefinitionsById)).toEqual([
      'ProcessDef1',
      'ProcessDef2',
    ]);
    expect(Object.keys(state.presetsById)).toEqual(['Preset1', 'Preset2']);
  });

  it('should have error state after a failed get', () => {
    const state = afterGetFailure();
    expect(state.loading).toEqual(false);
    expect(state.errorMessage).toEqual('oops');
  });

  it('should handle selecting a preset', () => {
    const state = processDefinition(afterGetSuccess(), {
      type: 'PROCESS_ASSIGN_SELECT_PRESET',
      preset: 'Preset2',
    });

    expect(state.loading).toEqual(false);
    expect(state.errorMessage).toEqual(null);

    expect(state.assignPreset).toEqual('Preset2');
    expect(state.assignProcessDefinition.id).toEqual('ProcessDef2');
    expect(state.assignVariables).toEqual({
      sequencer: 'sequencer-2',
      sample_type: 'sample_type-2',
    });
  });

  it('should handle de-selecting a preset', () => {
    const afterPreset = processDefinition(afterGetSuccess(), {
      type: 'PROCESS_ASSIGN_SELECT_PRESET',
      preset: 'Preset2',
    });
    expect(afterPreset.assignPreset).toEqual('Preset2');

    const state = processDefinition(afterPreset, {
      type: 'PROCESS_ASSIGN_SELECT_PRESET',
      preset: null,
    });

    expect(state.loading).toEqual(false);
    expect(state.errorMessage).toEqual(null);

    expect(state.assignPreset).toEqual(null);
    expect(state.assignProcessDefinition).toEqual(null);
    expect(state.assignVariables).toEqual({});
  });

  it('should handle overriding a preset with key/values and processDef', () => {
    // This test tests a few things at the same time for readability, as there is a lot
    // of dependency on state
    const afterPreset = processDefinition(afterGetSuccess(), {
      type: 'PROCESS_ASSIGN_SELECT_PRESET',
      preset: 'Preset2',
    });

    expect(afterPreset.assignPreset).toEqual('Preset2');
    expect(afterPreset.assignProcessDefinition.id).toEqual('ProcessDef2');
    expect(afterPreset.assignVariables).toEqual({
      sequencer: 'sequencer-2',
      sample_type: 'sample_type-2',
    });

    // Assigning a single value will make the preset null, because
    // we have no preset in this test data that matches the vars:
    const state1 = processDefinition(afterPreset, {
      type: 'PROCESS_ASSIGN_SET_VARIABLE',
      key: 'sequencer',
      value: 'sequencer-1',
    });

    expect(state1.assignPreset).toEqual(null);
    expect(state1.assignProcessDefinition.id).toEqual('ProcessDef2');
    expect(state1.assignVariables).toEqual({
      sequencer: 'sequencer-1',
      sample_type: 'sample_type-2',
    });

    // We still have no preset selected even if we change both the vars
    const state2 = processDefinition(state1, {
      type: 'PROCESS_ASSIGN_SET_VARIABLE',
      key: 'sample_type',
      value: 'sample_type-1',
    });

    expect(state2.assignPreset).toEqual(null);
    expect(state2.assignProcessDefinition.id).toEqual('ProcessDef2');
    expect(state2.assignVariables).toEqual({
      sequencer: 'sequencer-1',
      sample_type: 'sample_type-1',
    });

    // If we now also change the process, we expect all variables to be removed
    const state3 = processDefinition(state2, {
      type: 'PROCESS_ASSIGN_SELECT_PROCESS_DEF',
      processDefinitionId: 'ProcessDef1',
    });
    expect(state3.assignPreset).toEqual(null);
    expect(state3.assignProcessDefinition.id).toEqual('ProcessDef1');
    expect(state3.assignVariables).toEqual({});
  });

  it('should set the preset if it finds matching variables and process', () => {
    const afterProcess = processDefinition(afterGetSuccess(), {
      type: 'PROCESS_ASSIGN_SELECT_PROCESS_DEF',
      processDefinitionId: 'ProcessDef1',
    });
    expect(afterProcess.assignPreset).toEqual(null);

    const afterVariable1 = processDefinition(afterProcess, {
      type: 'PROCESS_ASSIGN_SET_VARIABLE',
      key: 'sample_type',
      value: 'sample_type-1',
    });
    expect(afterVariable1.assignPreset).toEqual(null);

    const afterVariable2 = processDefinition(afterVariable1, {
      type: 'PROCESS_ASSIGN_SET_VARIABLE',
      key: 'sequencer',
      value: 'sequencer-1',
    });
    expect(afterVariable2.assignPreset).toEqual('Preset1');
  });
});
