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
    resource: action.resource,
  };
}

export function updateEntryFailure(state, action) {
  return {
    ...state,
    updating: false,
    errorMessage: action.message,
  };
}

export function updateLocalChanges(state, action) {
  return {
    ...state,
    localChanges: {...action.localChanges},
  };
}

export function getEntryRequest(state, action) {
  return {
    ...state,
    loadingDetails: true,
    resource: null,
  };
}

export function getEntrySuccess(state, action) {
  return {
    ...state,
    loadingDetails: false,
    resource: action.resource,
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
    case `UPDATE_${resource}_LOCAL_REQUEST`:
      return updateLocalChanges(state, action);
    default:
      return state;
  }
};

export const entry = {
  // Required state for following an entry protocol
  initialState: {
    loadingDetails: false,
    updating: false,
    resource: null,
    localChanges: null,
  },

  getEntryRequest,
  getEntrySuccess,
  getEntryFailure,
  updateEntryRequest,
  updateEntrySuccess,
  updateEntryFailure,
  updateLocalChanges,
};

export const resource = {
  initialState: {...entry.initialState},
  createReducer: createResourceReducer,
};
