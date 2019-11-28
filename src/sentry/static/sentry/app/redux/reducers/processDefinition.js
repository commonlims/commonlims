import {Map} from 'immutable';

import {
  PROCESS_DEFINITIONS_GET_REQUEST,
  PROCESS_DEFINITIONS_GET_SUCCESS,
  PROCESS_DEFINITIONS_GET_FAILURE,
} from '../actions/processDefinition';

import {
  PROCESS_ASSIGN_SELECT_PRESET,
  PROCESS_ASSIGN_SELECT_PROCESS_DEF,
  PROCESS_ASSIGN_SET_VARIABLE,
} from '../actions/processAssign';

export const initialState = {
  loading: false,
  errorMessage: null,
  processDefinitionsById: {},
  presetsById: {},
  allVisibleSelected: false,

  mapProcessAndVarsToPreset: Map(),

  assignPreset: null,
  assignProcessDefinition: null,
  assignVariables: {},
};

function processAndVariablesToMapKey(process, variables) {
  return Map({...variables, __process: process});
}

const processDefinition = (state = initialState, action) => {
  switch (action.type) {
    case PROCESS_DEFINITIONS_GET_REQUEST:
      return {
        ...state,
        errorMessage: null,
        loading: true,
      };
    case PROCESS_DEFINITIONS_GET_SUCCESS: {
      // NOTE: This assumes that there is always just one preset with a particular set of variables
      // TODO: Enforce that in the backend.
      const presetsById = {};
      let mapProcessAndVarsToPreset = Map();
      for (const entry of action.processDefinitions.presets) {
        presetsById[entry.name] = entry;
        const key = processAndVariablesToMapKey(
          entry.processDefinitionId,
          entry.variables
        );
        mapProcessAndVarsToPreset = mapProcessAndVarsToPreset.set(key, entry.name);
      }

      const processDefinitionsById = {};
      for (const entry of action.processDefinitions.processDefinitions) {
        processDefinitionsById[entry.id] = entry;
      }

      return {
        ...state,
        errorMessage: null,
        loading: false,
        presetsById,
        processDefinitionsById,

        mapProcessAndVarsToPreset,

        // Clear all selections
        assignPreset: null,
        assignProcessDefinition: null,
        assignVariables: {},
      };
    }
    case PROCESS_DEFINITIONS_GET_FAILURE:
      return {
        ...state,
        errorMessage: action.errorMessage,
        loading: false,
      };
    // Assign
    case PROCESS_ASSIGN_SELECT_PRESET:
      if (action.preset === undefined) {
        throw new Error("action.preset can't be undefined");
      }

      let assignVariables, assignProcessDefinition;
      if (action.preset) {
        // When selecting a preset, we'll set the whole assign
        // state to the corresponding values
        const presetSettings = state.presetsById[action.preset];
        assignVariables = Object.assign({}, presetSettings.variables);
        assignProcessDefinition = Object.assign(
          {},
          state.processDefinitionsById[presetSettings.processDefinitionId]
        );
      } else {
        assignVariables = {};
        assignProcessDefinition = null;
      }
      return {
        ...state,
        assignPreset: action.preset,
        assignVariables,
        assignProcessDefinition,
      };
    case PROCESS_ASSIGN_SELECT_PROCESS_DEF:
      return {
        ...state,
        assignProcessDefinition: state.processDefinitionsById[action.processDefinitionId],
        assignVariables: {},
        assignPreset: null,
      };
    case PROCESS_ASSIGN_SET_VARIABLE: {
      // NOTE: `new` prefix because of scoping issues with using the same name (the linter
      // complains even if this is in its own scope)
      const newAssignVariables = {
        ...state.assignVariables,
        [action.key]: action.value,
      };

      const key = processAndVariablesToMapKey(
        state.assignProcessDefinition.id,
        newAssignVariables
      );
      const assignPreset = state.mapProcessAndVarsToPreset.get(key, null);

      return {
        ...state,
        assignVariables: newAssignVariables,
        assignPreset,
      };
    }
    default:
      return state;
  }
};

export default processDefinition;
