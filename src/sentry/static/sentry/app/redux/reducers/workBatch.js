import {resource} from 'app/redux/reducers/sharedList';
import {RESOURCE_NAME} from '../actions/workBatch.js';

export const initialState = {
  ...resource.initialState,
};

const workBatch = resource.createReducer(RESOURCE_NAME, initialState);
export default workBatch;
