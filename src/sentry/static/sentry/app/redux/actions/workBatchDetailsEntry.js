import {makeResourceActions} from 'app/redux/actions/sharedEntry';

export const RESOURCE_NAME = 'WORK_BATCH_DETAILS';

export const workBatchDetailsActions = makeResourceActions(
  RESOURCE_NAME,
  '/api/0/organizations/{org}/work-batch-details/{id}'
);
