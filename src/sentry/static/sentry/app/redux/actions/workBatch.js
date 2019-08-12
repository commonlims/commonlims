import axios from 'axios';

export const WORK_BATCHES_GET_REQUEST = 'WORK_BATCHES_GET_REQUEST';
export const WORK_BATCHES_GET_SUCCESS = 'WORK_BATCHES_GET_SUCCESS';
export const WORK_BATCHES_GET_FAILURE = 'WORK_BATCHES_GET_FAILURE';
export const WORK_BATCHES_TOGGLE_SELECT_ALL = 'WORK_BATCHES_TOGGLE_SELECT_ALL';
export const WORK_BATCH_TOGGLE_SELECT = 'WORK_BATCH_TOGGLE_SELECT';

export const workBatchesGetRequest = () => {
  return {
    type: WORK_BATCHES_GET_REQUEST,
  };
};

export const workBatchesGetSuccess = workBatches => {
  return {
    type: WORK_BATCHES_GET_SUCCESS,
    workBatches,
  };
};

export const workBatchesGetFailure = err => ({
  type: WORK_BATCHES_GET_FAILURE,
  message: err,
});

export const workBatchesGet = () => dispatch => {
  dispatch(workBatchesGetRequest());
  // TODO: create a new API client to replace api.jsx
  // and use axios instead of jquery there
  return axios
    .get('/api/0/organizations/sentry/work-batches/')
    .then(res => dispatch(workBatchesGetSuccess(res.data)))
    .catch(err => dispatch(workBatchesGetFailure(err)));
};

export const workBatchToggleSelect = id => {
  return {
    type: WORK_BATCH_TOGGLE_SELECT,
    id,
  };
};

export const workBatchesToggleSelectAll = doSelect => {
  return {
    type: WORK_BATCHES_TOGGLE_SELECT_ALL,
    doSelect,
  };
};
