import {resource} from './shared';
import {RESOURCE_NAME} from '../actions/substance';

export const initialState = {
  ...resource.initialState,
};

const substance = resource.createReducer(RESOURCE_NAME, initialState);
export default substance;
