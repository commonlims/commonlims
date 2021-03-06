// TODO: We've discussed using axios instead of the sentry Client. Then we'll need to set
// things up (auth etc) in the same way for POST requests being authenticated.
import {Client} from 'app/api';

import {t} from 'app/locale';

export const PROCESSES_GET_REQUEST = 'PROCESSES_GET_REQUEST';
export const processesGetRequest = () => {
  return {
    type: PROCESSES_GET_REQUEST,
  };
};

export const PROCESSES_GET_SUCCESS = 'PROCESSES_GET_SUCCESS';
export const processesGetSuccess = (processes) => {
  return {
    type: PROCESSES_GET_SUCCESS,
    processes,
  };
};

export const PROCESSES_GET_FAILURE = 'PROCESSES_GET_FAILURE';
export const processesGetFailure = (err) => ({
  type: PROCESSES_GET_FAILURE,
  message: err,
});

export const processesGet = () => (dispatch) => {
  dispatch(processesGetRequest());

  const data = {
    processes: [
      {
        id: '1',
      },
    ],
  };

  dispatch(processesGetSuccess(data));
};

export const PROCESSES_POST_REQUEST = 'PROCESSES_POST_REQUEST';
export const processesPostRequest = () => {
  return {
    type: PROCESSES_POST_REQUEST,
    msg: t('Saving changes...'),
  };
};

export const PROCESSES_POST_SUCCESS = 'PROCESSES_POST_SUCCESS';
export const processesPostSuccess = (response) => {
  return {
    type: PROCESSES_POST_SUCCESS,
    response,
  };
};

export const PROCESSES_POST_FAILURE = 'PROCESSES_POST_FAILURE';
export const processesPostFailure = (err) => ({
  type: PROCESSES_POST_FAILURE,
  message: err,
});

export const processesPost = (definitionId, variables, substances) => (dispatch) => {
  dispatch(processesPostRequest());
  const api = new Client();

  const data = {
    definitionId,
    variables,
    substances,
  };

  api.request('/api/0/organizations/lab/processes/', {
    method: 'POST',
    data,
    success: (res) => {
      dispatch(processesPostSuccess(res));
    },
    error: (err) => {
      dispatch(processesPostFailure(err));
    },
  });
};
