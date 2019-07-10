import {
  USER_TASKS_GET_REQUEST,
  USER_TASKS_GET_SUCCESS,
  USER_TASKS_GET_FAILURE,
  USER_TASK_TOGGLE_SELECT,
  USER_TASKS_TOGGLE_SELECT_ALL,
} from '../actions/userTask';

const initialState = {
  loading: false,
  errorMessage: null,
  userTasks: [],
};

const userTaskToggleSelect = (userTasks, id) =>
  userTasks.map(ut => {
    if (ut.id == id) {
      ut.selected = !!!ut.selected;
    }
    return ut;
  });

const userTasksToggleSelectAll = (userTasks, doSelect) =>
  userTasks.map(ut => {
    ut.selected = doSelect;
    return ut;
  });

const userTask = (state = initialState, action) => {
  switch (action.type) {
    case USER_TASKS_GET_REQUEST:
      return {
        ...state,
        errorMessage: null,
        loading: true,
      };
    case USER_TASKS_GET_SUCCESS: {
      return {
        ...state,
        userTasks: action.userTasks,
        errorMessage: null,
        loading: false,
      };
    }
    case USER_TASKS_GET_FAILURE:
      return {
        ...state,
        errorMessage: action.message,
        loading: false,
      };
    case USER_TASK_TOGGLE_SELECT:
      return {
        ...state,
        userTasks: userTaskToggleSelect(state.userTasks, action.id),
      };
    case USER_TASKS_TOGGLE_SELECT_ALL:
      return {
        ...state,
        userTasks: userTasksToggleSelectAll(state.userTasks, action.doSelect),
      };
    default:
      return state;
  }
};

export default userTask;
