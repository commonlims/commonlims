import merge from 'lodash/merge';
import {Set} from 'immutable';

import {
  WORK_BATCHES_GET_REQUEST,
  WORK_BATCHES_GET_SUCCESS,
  WORK_BATCHES_GET_FAILURE,
  WORK_BATCH_TOGGLE_SELECT,
  WORK_BATCHES_TOGGLE_SELECT_ALL,
  WORK_BATCHES_CREATE_REQUEST,
  WORK_BATCHES_CREATE_SUCCESS,
  WORK_BATCHES_CREATE_FAILURE,
} from '../actions/workBatch';

export const initialState = {
  loading: false,
  errorMessage: null,
  byIds: {},
  listViewState: {
    allVisibleSelected: false,
    groupBy: 'workbatch',
    search: 'workbatch.name:',
    visibleIds: [], // Sorted list of items visible in the current page
    selectedIds: new Set(), // The set of items selected, allowed to be outside of the current page
    pagination: {
      pageLinks: null, // The links returned by the backend
      cursor: '',
    },
  },
  creating: false,
};

// Returns an altered listViewState where a single element has been selected or deselected
// If select is null, the item will be toggled. If it's true, it's selected, if it's false
// it's deslected
function selectSingle(listViewState, id, select) {
  const shouldToggle = select === null || select === undefined;
  const shouldSelect = shouldToggle ? !listViewState.selectedIds.has(id) : select;
  const newSet = shouldSelect
    ? listViewState.selectedIds.add(id)
    : listViewState.selectedIds.delete(id);
  return {
    ...listViewState,
    selectedIds: newSet,
  };
}

// Returns a new listViewState, where the entire page (all visible items) has been selected or
// deselected. If select is true, the entire page is selected. If it's false the entire page is
// deselected.
function selectAll(listViewState, select) {
  const togglePage = select === null || select === undefined;
  const shouldSelectAll = togglePage ? !listViewState.allVisibleSelected : select;
  const selected = shouldSelectAll ? Set(listViewState.visibleIds) : Set();
  return {
    ...listViewState,
    allVisibleSelected: shouldSelectAll,
    selectedIds: selected,
  };
}

const workBatch = (state = initialState, action) => {
  switch (action.type) {
    case WORK_BATCHES_GET_REQUEST:
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
    case WORK_BATCHES_GET_SUCCESS: {
      const byIds = {};
      for (const entry of action.workBatches) {
        byIds[entry.id] = entry;
      }
      const visibleIds = action.workBatches.map(x => x.id);

      return {
        ...state,
        errorMessage: null,
        loading: false,
        byIds: merge({}, state.byIds, byIds),
        listViewState: {
          ...state.listViewState,
          visibleIds,
          pagination: {...state.pagination, pageLinks: action.link},
        },
      };
    }
    case WORK_BATCHES_GET_FAILURE:
      return {
        ...state,
        errorMessage: action.message,
        loading: false,
      };
    case WORK_BATCH_TOGGLE_SELECT: {
      return {
        ...state,
        listViewState: selectSingle(state.listViewState, action.id, action.doSelect),
      };
    }
    case WORK_BATCHES_TOGGLE_SELECT_ALL: {
      return {
        ...state,
        listViewState: selectAll(state.listViewState, action.doSelect),
      };
    }
    case WORK_BATCHES_CREATE_REQUEST:
      return {
        ...state,
        creating: true,
      };
    case WORK_BATCHES_CREATE_SUCCESS:
      return {
        ...state,
        creating: false,
      };
    case WORK_BATCHES_CREATE_FAILURE:
      return {
        ...state,
        creating: false,
        errorMessage: action.message,
      };
    default:
      return state;
  }
};

export default workBatch;
