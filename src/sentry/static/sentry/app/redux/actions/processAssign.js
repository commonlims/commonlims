// Assigning substances to processes. Note that these are in the same reducer as
// the processDefinition because selecting what to assign depends on process definitions.
// Consider renaming the reducer?
export const PROCESS_ASSIGN_SELECT_PRESET = 'PROCESS_ASSIGN_SELECT_PRESET';
export const processAssignSelectPreset = (preset) => {
  return {
    type: PROCESS_ASSIGN_SELECT_PRESET,
    preset,
  };
};

export const PROCESS_ASSIGN_SELECT_PROCESS_DEF = 'PROCESS_ASSIGN_SELECT_PROCESS_DEF';
export const processAssignSelectProcess = (processDefinitionId) => {
  return {
    type: PROCESS_ASSIGN_SELECT_PROCESS_DEF,
    processDefinitionId,
  };
};

export const PROCESS_ASSIGN_SET_VARIABLE = 'PROCESS_ASSIGN_SET_VARIABLE';
export const processAssignSetVariable = (key, value) => {
  return {
    type: PROCESS_ASSIGN_SET_VARIABLE,
    key,
    value,
  };
};
