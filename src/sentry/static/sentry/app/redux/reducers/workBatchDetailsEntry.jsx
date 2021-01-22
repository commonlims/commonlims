import {resource} from 'app/redux/reducers/sharedEntry';
import {RESOURCE_NAME} from '../actions/workBatchDetailsEntry';

const sharedInitialState = {
  ...resource.initialState,
};

const workBatchDetailsEntry = resource.createReducer(RESOURCE_NAME, sharedInitialState);

export default workBatchDetailsEntry;
