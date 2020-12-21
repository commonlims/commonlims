import {makeResourceActions} from 'app/redux/actions/sharedEntry';

export const RESOURCE_NAME = 'WORK_BATCH';

export const workBatchActions = makeResourceActions(
  RESOURCE_NAME,
  '/api/0/organizations/{org}/work-batches/'
);
