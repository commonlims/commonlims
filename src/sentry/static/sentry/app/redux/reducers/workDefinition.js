import {resource} from './sharedList';
import {RESOURCE_NAME} from '../actions/workDefinition.js';

export const initialState = {
  ...resource.initialState,
};

const workDefinition = resource.createReducer(RESOURCE_NAME, initialState);
export default workDefinition;
