// TODO: Here we interact with the IndicatorStore directly. It would be nice to refactor
// it to use redux, since it's used all over the place.
import IndicatorStore from 'app/stores/indicatorStore';

import {
  PROCESSES_GET_REQUEST,
  PROCESSES_GET_SUCCESS,
  PROCESSES_GET_FAILURE,
  PROCESSES_POST_REQUEST,
  PROCESSES_POST_SUCCESS,
  PROCESSES_POST_FAILURE,
} from '../actions/process';

export const initialState = {
  loading: false,
  saving: false,
  errorMessage: null,
  processById: {},
  indicatorToken: null,
};

const process = (state = initialState, action) => {
  switch (action.type) {
    case PROCESSES_GET_REQUEST:
      return {
        ...state,
        errorMessage: null,
        loading: true,
        saving: false,
      };
    case PROCESSES_GET_SUCCESS: {
      return {
        ...state,
        errorMessage: null,
        loading: false,
        saving: false,
      };
    }
    case PROCESSES_GET_FAILURE:
      return {
        ...state,
        errorMessage: action.message,
        loading: false,
        saving: false,
      };
    case PROCESSES_POST_REQUEST:
      const indicatorToken = IndicatorStore.add(action.msg);
      return {
        ...state,
        errorMessage: null,
        loading: false,
        saving: true,
        indicatorToken,
      };
    case PROCESSES_POST_SUCCESS:
      IndicatorStore.remove(state.indicatorToken);
      return {
        ...state,
        errorMessage: null,
        loading: false,
        saving: false,
        indicatorToken: null,
      };
    case PROCESSES_POST_FAILURE:
      IndicatorStore.remove(state.indicatorToken);
      return {
        ...state,
        errorMessage: action.message,
        loading: false,
        saving: false,
        indicatorToken: null,
      };
    default:
      return state;
  }
};

export default process;
