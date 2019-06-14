import axios from 'axios';

export const USER_TASKS_GET_REQUEST = 'USER_TASKS_GET_REQUEST';
export const USER_TASKS_GET_SUCCESS = 'USER_TASKS_GET_SUCCESS';
export const USER_TASKS_GET_FAILURE = 'USER_TASKS_GET_FAILURE';

export const userTasksGetRequest = () => {
  return {
    type: USER_TASKS_GET_REQUEST,
  };
};

export const userTasksGetSuccess = userTasks => {
  return {
    type: USER_TASKS_GET_SUCCESS,
    userTasks,
  };
};

export const userTasksGetFailure = err => ({
  type: USER_TASKS_GET_FAILURE,
  message: err,
});

export const userTasksGet = () => dispatch => {
  dispatch(userTasksGetRequest());
  // TODO: create a new API client to replace api.jsx
  // and use axios instead of jquery there
  return axios
    .get('/api/0/organizations/sentry/user-tasks/')
    .then(res => dispatch(userTasksGetSuccess(res.data)))
    .catch(err => dispatch(userTasksGetFailure(err)));
};
