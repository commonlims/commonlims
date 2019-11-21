import {
  PROCESS_DEFINITIONS_GET_REQUEST,
  PROCESS_DEFINITIONS_GET_SUCCESS,
  PROCESS_DEFINITIONS_GET_FAILURE,
} from '../actions/processDefinition';

const initialState = {
  loading: false,
  errorMessage: null,
  processDefinitionsById: {},
  presetsById: {},
  allVisibleSelected: false,
};

const processDefinition = (state = initialState, action) => {
  switch (action.type) {
    case PROCESS_DEFINITIONS_GET_REQUEST:
      return {
        ...state,
        errorMessage: null,
        loading: true,
      };
    case PROCESS_DEFINITIONS_GET_SUCCESS: {
      const presetsById = {};
      for (const entry of action.processDefinitions.presets) {
        presetsById[entry.name] = entry;
      }

      const processDefinitionsById = {};
      for (const entry of action.processDefinitions.processes) {
        processDefinitionsById[entry.name] = entry;
      }

      return {
        ...state,
        errorMessage: null,
        loading: false,
        presetsById,
        processDefinitionsById,
      };
    }
    case PROCESS_DEFINITIONS_GET_FAILURE:
      return {
        ...state,
        errorMessage: action.message,
        loading: false,
      };
    default:
      return state;
  }
};

export default processDefinition;
