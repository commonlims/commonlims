import {Client} from 'app/api';
import {browserHistory} from 'react-router';
import {makeResourceActions} from './shared';

export const RESOURCE_NAME = 'WORK_BATCH';

export const workBatchActions = makeResourceActions(
  RESOURCE_NAME,
  '/api/0/organizations/{org}/work-batches/'
);

//
// New work batch
//
// workBatchActions.createSuccess = workBatchesCreateSuccess;

// Redirect pattern:
// * Redirects after successful actions are handled in the same actions file
// * In order not to cause redirects for components that don't require it, redirect only
//   if the action receives a `redirect: true` flag

//
// Current workbatch
//
export const WORK_BATCHES_SELECT_TASK = 'WORK_BATCHES_SELECT_TASK';
export const workBatchesSelectTask = (task) => ({
  type: WORK_BATCHES_SELECT_TASK,
  task,
});
console.log(workBatchActions);
