import {resource} from './shared';
import {RESOURCE_NAME} from '../actions/availableWorkUnit';

export const initialState = {
  ...resource.initialState,
};

const availableWorkUnit = resource.createReducer(RESOURCE_NAME, initialState);
export default availableWorkUnit;
