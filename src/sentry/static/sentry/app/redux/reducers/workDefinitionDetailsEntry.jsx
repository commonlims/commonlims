import {resource} from 'app/redux/reducers/sharedEntry';

export const WORK_DEFINITION_DETAILS = 'WORK_DEFINITION_DETAILS';

const sharedInitialState = {
  ...resource.initialState,
};

const workDefinitionDetailsEntry = resource.createReducer(
  WORK_DEFINITION_DETAILS,
  sharedInitialState
);

export default workDefinitionDetailsEntry;
