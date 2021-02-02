import axios from 'axios';
import {makeResourceActions} from './sharedEntry';

export const RESOURCE_NAME = 'WORK_DEFINITION_DETAILS';

export const workDefinitionDetailsActions = makeResourceActions(
  RESOURCE_NAME,
  '/api/0/organizations/{org}/work-definition-details/{id}'
);
