export function updateEntryRequest(state, action) {
  return {
    ...state,
    updating: true,
    errorMessage: null,
  };
}

export function updateEntrySuccess(state, action) {
  return {
    ...state,
    updating: false,
    entry: action.entry,
  };
}

export function updateEntryFailure(state, action) {
  return {
    ...state,
    updating: false,
    errorMessage: action.message,
  };
}

export function getEntryRequest(state, action) {
  return {
    ...state,
    loadingDetails: true,
    entry: null,
  };
}

export function getEntrySuccess(state, action) {
  return {
    ...state,
    loadingDetails: false,
    entry: action.entry,
  };
}

export function getEntryFailure(state, action) {
  return {
    ...state,
    errorMessage: action.message,
    loadingDetails: false,
  };
}

const createResourceReducer = (resource, initialState) => (
  state = initialState,
  action
) => {
  switch (action.type) {
    case `GET_${resource}_REQUEST`:
      return getEntryRequest(state, action);
    case `GET_${resource}_SUCCESS`:
      return getEntrySuccess(state, action);
    case `GET_${resource}_FAILURE`:
      return getEntryFailure(state, action);
    case `UPDATE_${resource}_REQUEST`:
      return updateEntryRequest(state, action);
    case `UPDATE_${resource}_SUCCESS`:
      return updateEntrySuccess(state, action);
    case `UPDATE_${resource}_FAILURE`:
      return updateEntryFailure(state, action);
    default:
      return state;
  }
};

export const entry = {
  // Required state for following an entry protocol
  initialState: {
    loadingDetails: false,
    updating: false,
    entry: null,
  },

  getEntryRequest,
  getEntrySuccess,
  getEntryFailure,
  updateEntryRequest,
  updateEntrySuccess,
  updateEntryFailure,
};

export const resource = {
  initialState: {...entry.initialState},

  createReducer: createResourceReducer,
};
