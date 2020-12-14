import {makeResourceActions} from './shared';

export const RESOURCE_NAME = 'AVAILABE_WORK_UNIT';

export const availableWorkUnitActions = makeResourceActions(
  RESOURCE_NAME,
  '/api/0/work-definitions/{id}/available-work/',
  'NA',
  'id'
);
