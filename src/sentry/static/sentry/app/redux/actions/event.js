import {makeResourceActions} from 'app/redux/actions/sharedList';

export const RESOURCE_NAME = 'EVENT';

export const eventActions = makeResourceActions(
  RESOURCE_NAME,
  '/api/0/organizations/{org}/events/'
);
