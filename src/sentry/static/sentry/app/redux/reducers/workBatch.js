import {resource} from 'app/redux/reducers/sharedList';
import {RESOURCE_NAME} from 'app/redux/actions/workBatchEntry.js';

export const initialState = {
  ...resource.initialState,
};

const workBatch = resource.createReducer(RESOURCE_NAME, initialState);
export default workBatch;
