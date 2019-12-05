import {
  PROJECT_SEARCH_ENTRIES_GET_REQUEST,
  PROJECT_SEARCH_ENTRIES_GET_SUCCESS,
  PROJECT_SEARCH_ENTRIES_GET_FAILURE,
} from '../actions/projectSearchEntry';

// NOTE: We export the initial state in order to use it in tests
export const initialState = {
  loading: false,
  errorMessage: null,
  projectSearchEntries: [],
  allVisibleSelected: false,
  visibleIds: [],
  selectedIds: [],
  groupBy: 'name',
  search: 'name',
  byIds: {}, // The actual substance entries (TODO: have parentById and childById?)
  cursor: '', // The cursor into the current dataset
  paginationEnabled: true,
};

const projectSearchEntry = (state = initialState, action) => {
  switch (action.type) {
    case PROJECT_SEARCH_ENTRIES_GET_REQUEST: {
      return {
        ...state,
        errorMessage: null,
        loading: true,
        search: action.search,
        groupBy: action.groupBy,
        cursor: action.cursor,
      };
    }
    case PROJECT_SEARCH_ENTRIES_GET_SUCCESS: {
      return {
        ...state,
        errorMessage: null,
        loading: false,
        byIds: action.projectSearchEntries,
        visibleIds: Object.keys(action.projectSearchEntries),
        pageLinks: action.link,
      };
    }
    case PROJECT_SEARCH_ENTRIES_GET_FAILURE:
      return {
        ...state,
        errorMessage: action.message,
        loading: false,
      };
    default:
      return state;
  }
};

export default projectSearchEntry;
