import {resource} from 'app/redux/reducers/shared';

export const WORK_BATCH_DEFINITION = 'WORK_BATCH_DEFINITION';

const sharedInitialState = {
  ...resource.initialState,
};

const workBatchDefinitionEntry = resource.createReducer(
  WORK_BATCH_DEFINITION,
  sharedInitialState
);

export default workBatchDefinitionEntry;
