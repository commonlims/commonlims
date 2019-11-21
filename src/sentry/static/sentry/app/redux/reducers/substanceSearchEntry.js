import merge from 'lodash/merge';
import {Set} from 'immutable';

import {
  SUBSTANCE_SEARCH_ENTRIES_GET_REQUEST,
  SUBSTANCE_SEARCH_ENTRIES_GET_SUCCESS,
  SUBSTANCE_SEARCH_ENTRIES_GET_FAILURE,
  SUBSTANCE_SEARCH_ENTRIES_TOGGLE_SELECT_ALL,
  SUBSTANCE_SEARCH_ENTRY_TOGGLE_SELECT,
} from '../actions/substanceSearchEntry';

// NOTE: We export the initial state in order to use it in tests
export const initialState = {
  loading: false,
  errorMessage: null,
  substanceSearchEntries: [],
  allVisibleSelected: false,
  groupBy: 'substance',

  byIds: {}, // The actual substance entries (TODO: have parentById and childById?)
  visibleIds: [], // Sorted list of items visible in the current page
  selectedIds: new Set(), // The set of items selected, allowed to be outside of the current page
};

function toggleSelectPage(state, doSelect) {
  if (doSelect) {
    return new Set(state.visibleIds);
  } else {
    return new Set();
  }
}

const substanceSearchEntry = (state = initialState, action) => {
  switch (action.type) {
    case SUBSTANCE_SEARCH_ENTRIES_GET_REQUEST:
      return {
        ...state,
        errorMessage: null,
        loading: true,
      };
    case SUBSTANCE_SEARCH_ENTRIES_GET_SUCCESS: {
      // The action provides us with the raw data as a list, here we turn it into
      // a dictionary and then update the store's byIds as required.
      const byIds = {};
      for (const entry of action.substanceSearchEntries) {
        byIds[entry.id] = entry;
      }
      const visibleIds = action.substanceSearchEntries.map(x => x.id);

      return {
        ...state,
        errorMessage: null,
        loading: false,
        byIds: merge({}, state.byIds, byIds),
        visibleIds,
      };
    }
    case SUBSTANCE_SEARCH_ENTRIES_GET_FAILURE:
      return {
        ...state,
        errorMessage: action.message,
        loading: false,
      };
    case SUBSTANCE_SEARCH_ENTRIES_TOGGLE_SELECT_ALL:
      // Selects or deselects all items on the current page
      return {
        ...state,
        allVisibleSelected: action.doSelect,
        selectedIds: toggleSelectPage(state, action.doSelect),
      };
    case SUBSTANCE_SEARCH_ENTRY_TOGGLE_SELECT:
      const doSelect =
        action.doSelect === null ? !state.selectedIds.has(action.id) : action.doSelect;
      const newSet = doSelect
        ? state.selectedIds.add(action.id)
        : state.selectedIds.delete(action.id);
      return {
        ...state,
        selectedIds: newSet,
      };
    default:
      return state;
  }
};

export default substanceSearchEntry;
