import {
  SUBSTANCES_GET_REQUEST,
  SUBSTANCES_GET_SUCCESS,
  SUBSTANCES_GET_FAILURE,
  SUBSTANCES_TOGGLE_SELECT_ALL,
  SUBSTANCE_GET_FAILURE,
  SUBSTANCE_GET_REQUEST,
  SUBSTANCE_GET_SUCCESS,
} from '../actions/substance';

const initialState = {
  loading: false,
  errorMessage: null,
  substances: [],
  byIds: {},
};

const substancesToggleSelectAll = (substances, doSelect) =>
  substances.map(ut => {
    ut.selected = doSelect;
    return ut;
  });

const substance = (state = initialState, action) => {
  switch (action.type) {
    case SUBSTANCES_GET_REQUEST:
      return {
        ...state,
        errorMessage: null,
        loading: true,
      };
    case SUBSTANCES_GET_SUCCESS: {
      return {
        ...state,
        substances: action.substances,
        errorMessage: null,
        loading: false,
      };
    }
    case SUBSTANCES_GET_FAILURE:
      return {
        ...state,
        errorMessage: action.message,
        loading: false,
      };
    case SUBSTANCES_TOGGLE_SELECT_ALL:
      return {
        ...state,
        substances: substancesToggleSelectAll(state.substances, action.doSelect),
      };

    case SUBSTANCE_GET_REQUEST:
      return {
        ...state,
        errorMessage: null,
        loading: true,
      };
    case SUBSTANCE_GET_SUCCESS: {
      // Add view state to the object:
      action.substance.viewState = {
        activeTab: action.substance.tabs[0].id,
      };

      const byIds = Object.assign({}, state.byIds, {
        [action.substance.id]: action.substance,
      });
      return {
        ...state,
        errorMessage: null,
        loading: false,
        byIds,
      };
    }
    case SUBSTANCE_GET_FAILURE: {
      return {
        ...state,
        errorMessage: 'Not able to retrieve the substance',
        loading: false,
      };
    }

    default:
      return state;
  }
};

export default substance;
