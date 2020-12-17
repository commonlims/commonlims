import axios from 'axios';
import {makeResourceActions} from './sharedList';

export const RESOURCE_NAME = 'WORK_DEFINITION';

export const workDefinitionActions = makeResourceActions(
  RESOURCE_NAME,
  '/api/0/organizations/{org}/NOT-IMPLEMENTED/', // available-work can return work definitions
  '/api/0/work-definitions/{id}/'
);
