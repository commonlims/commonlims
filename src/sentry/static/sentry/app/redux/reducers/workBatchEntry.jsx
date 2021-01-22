import {resource} from 'app/redux/reducers/sharedList';
import {RESOURCE_NAME} from 'app/redux/actions/workBatchEntry';

const sharedInitialState = {
  ...resource.initialState,
};

const workBatchEntry = resource.createReducer(RESOURCE_NAME, sharedInitialState);

export default workBatchEntry;
