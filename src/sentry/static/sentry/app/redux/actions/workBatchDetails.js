import {makeResourceActions} from './shared';
export const RESOURCE_NAME = 'WORK_BATCH_DETAILS';

export const workBatchDetailsActions = makeResourceActions(
  RESOURCE_NAME,
  null,
  (org, id) => `/${org}/workbatches/${id}/`
);
