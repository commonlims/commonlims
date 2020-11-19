import {resource} from 'app/redux/reducers/shared';

export const WORK_BATCH = 'WORK_BATCH';

const sharedInitialState = {
  ...resource.initialState,
};

const workBatchEntry = resource.createReducer(WORK_BATCH, sharedInitialState);

export default workBatchEntry;
