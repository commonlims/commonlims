import {resource} from 'app/redux/reducers/sharedEntry';

export const WORK_BATCH_DETAILS = 'WORK_BATCH_DETAILS';

const sharedInitialState = {
  ...resource.initialState,
};

const workBatchDetailsEntry = resource.createReducer(
  WORK_BATCH_DETAILS,
  sharedInitialState
);

export default workBatchDetailsEntry;
