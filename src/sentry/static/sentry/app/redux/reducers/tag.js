import {TAGS_GET_REQUEST, TAGS_GET_SUCCESS, TAGS_GET_FAILURE} from '../actions/tag';

const initialState = {
  loading: false,
  errorMessage: null,
  tags: {},
};

const tag = (state = initialState, action) => {
  switch (action.type) {
    case TAGS_GET_REQUEST:
      return {
        ...state,
        errorMessage: null,
        loading: true,
      };
    case TAGS_GET_SUCCESS: {
      return {
        ...state,
        tags: action.tags,
        errorMessage: null,
        loading: false,
      };
    }
    case TAGS_GET_FAILURE:
      return {
        ...state,
        errorMessage: action.message,
        loading: false,
      };
    default:
      return state;
  }
};

export default tag;
