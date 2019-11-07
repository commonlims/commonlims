import {
  SAVED_SEARCHES_GET_REQUEST,
  SAVED_SEARCHES_GET_SUCCESS,
  SAVED_SEARCHES_GET_FAILURE,
} from '../actions/savedSearch';

const initialState = {
  loading: false,
  errorMessage: null,
  savedSearches: [],
  byIds: {},
};

const savedSearch = (state = initialState, action) => {
  switch (action.type) {
    case SAVED_SEARCHES_GET_REQUEST:
      return {
        ...state,
        errorMessage: null,
        loading: true,
      };
    case SAVED_SEARCHES_GET_SUCCESS: {
      return {
        ...state,
        savedSearches: action.savedSearches,
        errorMessage: null,
        loading: false,
      };
    }
    case SAVED_SEARCHES_GET_FAILURE:
      return {
        ...state,
        errorMessage: action.message,
        loading: false,
      };
    default:
      return state;
  }
};

export default savedSearch;
