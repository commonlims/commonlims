import axios from 'axios';

import {t} from 'app/locale';

export const PROCESSES_GET_REQUEST = 'PROCESSES_GET_REQUEST';
export const PROCESSES_GET_SUCCESS = 'PROCESSES_GET_SUCCESS';
export const PROCESSES_GET_FAILURE = 'PROCESSES_GET_FAILURE';

export const PROCESSES_POST_REQUEST = 'PROCESSES_POST_REQUEST';
export const PROCESSES_POST_SUCCESS = 'PROCESSES_POST_SUCCESS';
export const PROCESSES_POST_FAILURE = 'PROCESSES_POST_FAILURE';

export const processesGetRequest = () => {
  return {
    type: PROCESSES_GET_REQUEST,
  };
};

export const processesGetSuccess = processes => {
  return {
    type: PROCESSES_GET_SUCCESS,
    processes,
  };
};

export const processesGetFailure = err => ({
  type: PROCESSES_GET_FAILURE,
  message: err,
});

export const processesGet = () => dispatch => {
  dispatch(processesGetRequest());

  const data = {
    processes: [
      {
        id: '1',
      },
    ],
  };

  dispatch(processesGetSuccess(data));

  // return axios
  //   .get('/api/0/organizations/lab/processes/')
  //   .then(res => {
  //     // TODO: keep the state outside of these
  //     for (const entry of res.data) {
  //       setInitialViewState(groupBy, entry);
  //     }
  //     dispatch(processesGetSuccess(res.data));
  //   })
  //   .catch(err => dispatch(processesGetFailure(err)));
};

export const processesPostRequest = () => {
  return {
    type: PROCESSES_POST_REQUEST,
    msg: t('Saving changes...'),
  };
};

export const processesPostSuccess = response => {
  return {
    type: PROCESSES_POST_SUCCESS,
    response,
  };
};

export const processesPostFailure = err => ({
  type: PROCESSES_POST_FAILURE,
  message: err,
});

export const processesPost = (definitionId, variables, substances) => dispatch => {
  const data = {
    definitionId,
    variables,
    substances,
  };

  dispatch(processesPostRequest());

  return axios
    .get('/api/0/organizations/lab/processes/', data)
    .then(res => {
      dispatch(processesPostSuccess(res.data));
    })
    .catch(err => dispatch(processesPostFailure(err)));
};
