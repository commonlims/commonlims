import {resource} from './shared';
import {RESOURCE_NAME} from '../actions/availableWork.js';

export const initialState = {
  ...resource.initialState,
};

const availableWork = resource.createReducer(RESOURCE_NAME, initialState);
export default availableWork;
