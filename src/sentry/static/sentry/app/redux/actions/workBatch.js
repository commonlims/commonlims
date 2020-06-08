import axios from 'axios';
import {Client} from 'app/api';
import {browserHistory} from 'react-router';

export const WORK_BATCHES_GET_REQUEST = 'WORK_BATCHES_GET_REQUEST';
export const workBatchesGetRequest = (search, groupBy, cursor) => {
  return {
    type: WORK_BATCHES_GET_REQUEST,
    search,
    groupBy,
    cursor,
  };
};

export const WORK_BATCHES_GET_SUCCESS = 'WORK_BATCHES_GET_SUCCESS';
export const workBatchesGetSuccess = workBatches => {
  return {
    type: WORK_BATCHES_GET_SUCCESS,
    workBatches,
  };
};

export const WORK_BATCHES_GET_FAILURE = 'WORK_BATCHES_GET_FAILURE';
export const workBatchesGetFailure = err => ({
  type: WORK_BATCHES_GET_FAILURE,
  message: err,
});

export const workBatchesGet = (search, groupBy, cursor) => dispatch => {
  // TODO: Use the search/groupby/cursor
  //
  dispatch(workBatchesGetRequest(search, groupBy, cursor));
  // TODO: create a new API client to replace api.jsx
  // and use axios instead of jquery there
  return axios
    .get('/api/0/organizations/lab/work-batches/')
    .then(res => dispatch(workBatchesGetSuccess(res.data)))
    .catch(err => dispatch(workBatchesGetFailure(err)));
};

export const WORK_BATCH_TOGGLE_SELECT = 'WORK_BATCH_TOGGLE_SELECT';
export const workBatchToggleSelect = id => {
  return {
    type: WORK_BATCH_TOGGLE_SELECT,
    id,
  };
};

export const WORK_BATCHES_TOGGLE_SELECT_ALL = 'WORK_BATCHES_TOGGLE_SELECT_ALL';
export const workBatchesToggleSelectAll = doSelect => {
  return {
    type: WORK_BATCHES_TOGGLE_SELECT_ALL,
    doSelect,
  };
};

//
// New work batch
//

export const WORK_BATCHES_CREATE_REQUEST = 'WORK_BATCHES_CREATE_REQUEST';
export const workBatchesCreateRequest = () => {
  return {
    type: WORK_BATCHES_CREATE_REQUEST,
  };
};

export const WORK_BATCHES_CREATE_SUCCESS = 'WORK_BATCHES_CREATE_SUCCESS';
export const workBatchesCreateSuccess = workBatch => {
  return {
    type: WORK_BATCHES_CREATE_SUCCESS,
    workBatch,
  };
};

export const WORK_BATCHES_CREATE_FAILURE = 'WORK_BATCHES_CREATE_FAILURE';
export const workBatchesCreateFailure = err => ({
  type: WORK_BATCHES_CREATE_FAILURE,
  message: err,
});

// Redirect pattern:
// * Redirects after successful actions are handled in the same actions file
// * In order not to cause redirects for components that don't require it, redirect only
//   if the action receives a `redirect: true` flag

export const createWorkBatch = (org, taskIds, redirect) => dispatch => {
  dispatch(workBatchesCreateRequest());

  const api = new Client();
  const data = {
    tasks: taskIds,
  };

  // TODO: synch work-batches/workbatches
  api.request(`/api/0/organizations/${org.slug}/work-batches/`, {
    method: 'POST',
    data,
    success: res => {
      dispatch(workBatchesCreateSuccess(res.workBatch));
      const createdId = res.workBatch.id;
      if (redirect) {
        browserHistory.push(`/${org.slug}/workbatches/${createdId}/`);
      }
    },
    error: err => {
      dispatch(workBatchesCreateFailure(err));
    },
  });
};

//
// Current workbatch
//
export const WORK_BATCHES_SELECT_TASK = 'WORK_BATCHES_SELECT_TASK';
export const workBatchesSelectTask = task => ({
  type: WORK_BATCHES_SELECT_TASK,
  task,
});
