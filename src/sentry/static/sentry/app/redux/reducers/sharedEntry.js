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

export function createEntryRequest(state, action) {
  return {
    ...state,
    creating: true,
  };
}

export function createEntrySuccess(state, action) {
  return {
    ...state,
    creating: false,
    entry: action.entry,
  };
}

export function createEntryFailure(state, action) {
  return {
    ...state,
    creating: false,
    errorMessage: action.message,
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
    case `CREATE_${resource}_REQUEST`:
      return createEntryRequest(state, action);
    case `CREATE_${resource}_SUCCESS`:
      return createEntrySuccess(state, action);
    case `CREATE_${resource}_FAILURE`:
      return createEntryFailure(state, action);
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
    creating: false,
  },

  getEntryRequest,
  getEntrySuccess,
  getEntryFailure,
  updateEntryRequest,
  updateEntrySuccess,
  updateEntryFailure,
  createEntryRequest,
  createEntrySuccess,
  createEntryFailure,
};

export const resource = {
  initialState: {...entry.initialState},

  createReducer: createResourceReducer,
};
