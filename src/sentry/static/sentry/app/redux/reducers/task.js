import {TASKS_GET_REQUEST, TASKS_GET_SUCCESS, TASKS_GET_FAILURE} from '../actions/task';

const initialState = {
  loading: false,
  errorMessage: null,
  tasks: [],
};

const task = (state = initialState, action) => {
  switch (action.type) {
    case TASKS_GET_REQUEST:
      return {
        ...state,
        errorMessage: null,
        loading: true,
      };
    case TASKS_GET_SUCCESS: {
      return {
        ...state,
        tasks: action.tasks,
        errorMessage: null,
        loading: false,
      };
    }
    case TASKS_GET_FAILURE:
      return {
        ...state,
        errorMessage: action.message,
        loading: false,
      };
    default:
      return state;
  }
};

export default task;
