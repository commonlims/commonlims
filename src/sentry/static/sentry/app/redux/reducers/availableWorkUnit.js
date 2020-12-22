import {resource} from './sharedList';
import {RESOURCE_NAME} from '../actions/availableWorkUnit';

export const initialState = {
  ...resource.initialState,
};

const availableWorkUnit = resource.createReducer(RESOURCE_NAME, initialState);
export default availableWorkUnit;
