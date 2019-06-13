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
  // and use fetch instead of jquery
  return fetch('/api/0/organizations/sentry/user-tasks/', {
    method: 'get',
  })
    .then(res => res.json())
    .then(body => {
      if (body.error) {
        return dispatch(userTasksGetFailure(body.error));
      }
      return dispatch(userTasksGetSuccess(body.submissions));
    })
    .catch(ex => dispatch(userTasksGetFailure(ex.message)));
};
