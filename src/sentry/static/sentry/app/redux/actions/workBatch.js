import {Client} from 'app/api';
import {browserHistory} from 'react-router';
import {makeResourceActions} from './shared';

export const RESOURCE_NAME = 'WORK_BATCH';

export const workBatchActions = makeResourceActions(
  RESOURCE_NAME,
  '/api/0/organizations/lab/work-batches/' // TODO: nolab
);

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
