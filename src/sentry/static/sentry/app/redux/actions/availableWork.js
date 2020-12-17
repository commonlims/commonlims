import axios from 'axios';
import {makeResourceActions} from './sharedList';

export const RESOURCE_NAME = 'AVAILABLE_WORK';

// The available work endpoint returns work definitions, but only those available to the user
// and with count of work items
export const availableWorkActions = makeResourceActions(
  RESOURCE_NAME,
  '/api/0/organizations/{org}/available-work/'
);
