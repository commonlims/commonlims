import {resource} from './sharedEntry';
import {RESOURCE_NAME} from 'app/redux/actions/workDefinitionEntry.js';

export const initialState = {
  ...resource.initialState,
};

const workDefinitionEntry = resource.createReducer(RESOURCE_NAME, initialState);
export default workDefinitionEntry;
