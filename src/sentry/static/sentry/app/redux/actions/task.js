import axios from 'axios';

export const TASKS_GET_REQUEST = 'TASKS_GET_REQUEST';
export const TASKS_GET_SUCCESS = 'TASKS_GET_SUCCESS';
export const TASKS_GET_FAILURE = 'TASKS_GET_FAILURE';

export const tasksGetRequest = () => {
  return {
    type: TASKS_GET_REQUEST,
  };
};

export const tasksGetSuccess = tasks => {
  return {
    type: TASKS_GET_SUCCESS,
    tasks,
  };
};

export const tasksGetFailure = err => ({
  type: TASKS_GET_FAILURE,
  message: err,
});

export const tasksGet = () => dispatch => {
  dispatch(tasksGetRequest());
  // TODO: create a new API client to replace api.jsx
  // and use axios instead of jquery there
  return axios
    .get('/api/0/organizations/sentry/tasks/')
    .then(res => dispatch(tasksGetSuccess(res.data)))
    .catch(err => dispatch(tasksGetFailure(err)));
};
