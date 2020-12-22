import {resource} from './sharedEntry';
import {RESOURCE_NAME} from '../actions/workDefinition.js';

export const initialState = {
  ...resource.initialState,
};

const workDefinition = resource.createReducer(RESOURCE_NAME, initialState);
export default workDefinition;
