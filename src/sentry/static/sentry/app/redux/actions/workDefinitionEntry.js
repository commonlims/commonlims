import axios from 'axios';
import {makeResourceActions} from './sharedEntry';

export const RESOURCE_NAME = 'WORK_DEFINITION';

export const workDefinitionActions = makeResourceActions(
  RESOURCE_NAME,
  '/api/0/work-definitions/{id}/'
);
