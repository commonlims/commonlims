import merge from 'lodash/merge';
import {Set} from 'immutable';

// Defines base state should look for all list components
//

// Returns an altered listViewState where a single element has been selected or deselected
// If select is null, the item will be toggled. If it's true, it's selected, if it's false
// it's deselected
export function selectSingle(state, action) {
  const {listViewState} = state;
  const {id, doSelect} = action;

  const shouldToggle = doSelect === null || doSelect === undefined;
  const shouldSelect = shouldToggle ? !listViewState.selectedIds.has(id) : doSelect;
  const selectedIds = shouldSelect
    ? listViewState.selectedIds.add(id)
    : listViewState.selectedIds.delete(id);

  return {
    ...state,
    listViewState: {
      ...listViewState,
      selectedIds,
    },
  };
}

// Returns a new listViewState, where the entire page (all visible items) has been selected or
// deselected. If select is true, the entire page is selected. If it's false the entire page is
// deselected.
export function selectAll(state, action) {
  const {doSelect} = action;
  const togglePage = doSelect === null || doSelect === undefined;
  const {listViewState} = state;
  const shouldSelectAll = togglePage ? !listViewState.allVisibleSelected : doSelect;
  const selected = shouldSelectAll ? Set(listViewState.visibleIds) : Set();
  return {
    ...state,
    listViewState: {
      ...listViewState,
      allVisibleSelected: shouldSelectAll,
      selectedIds: selected,
    },
  };
}

// Returns a new state when a request for getting a list has been received
export function getListRequest(state, action) {
  return {
    ...state,
    errorMessage: null,
    loading: true,
    listViewState: {
      ...state.listViewState,
      search: action.search,
      groupBy: action.groupBy,
      pagination: {...state.listViewState.pagination, cursor: action.cursor},
    },
  };
}

export function getListSuccess(state, action) {
  const byIds = {};
  for (const entry of action.entries) {
    byIds[entry.id] = entry;
  }
  const visibleIds = action.entries.map((x) => x.id);

  return {
    ...state,
    errorMessage: null,
    loading: false,
    byIds: merge({}, state.byIds, byIds),
    listViewState: {
      ...state.listViewState,
      visibleIds,
      pagination: {...state.listViewState.pagination, pageLinks: action.link},
    },
  };
}

export function getListFailure(state, action) {
  return {
    ...state,
    errorMessage: action.message,
    loading: false,
  };
}

const createResourceReducer = (resource, initialState) => (
  state = initialState,
  action
) => {
  switch (action.type) {
    case `GET_${resource}_LIST_REQUEST`:
      return getListRequest(state, action);
    case `GET_${resource}_LIST_SUCCESS`:
      return getListSuccess(state, action);
    case `GET_${resource}_LIST_FAILURE`:
      return getListFailure(state, action);
    case `SELECT_${resource}`:
      return selectSingle(state, action);
    case `SELECT_PAGE_OF_${resource}`:
      return selectAll(state, action);
    default:
      return state;
  }
};

export const list = {
  // State we require for following a list protocol
  initialState: {
    loading: false,
    errorMessage: null,
    byIds: {},
    listViewState: {
      allVisibleSelected: false,
      groupBy: null,
      search: null,
      visibleIds: [], // Sorted list of items visible in the current page
      selectedIds: new Set(), // The set of items selected, allowed to be outside of the current page
      pagination: {
        pageLinks: null, // The links returned by the backend
        cursor: null,
      },
    },
  },

  // All reducers available for that list:
  selectSingle,
  selectAll,
  getListRequest,
  getListSuccess,
  getListFailure,
};

// A resource follows both the list and entry protocols
export const resource = {
  initialState: {...list.initialState},

  createReducer: createResourceReducer,
};
