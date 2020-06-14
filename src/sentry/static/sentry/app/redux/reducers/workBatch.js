import {
  WORK_BATCHES_GET_REQUEST,
  WORK_BATCHES_GET_SUCCESS,
  WORK_BATCHES_GET_FAILURE,
  WORK_BATCH_TOGGLE_SELECT,
  WORK_BATCHES_TOGGLE_SELECT_ALL,
  WORK_BATCHES_CREATE_REQUEST,
  WORK_BATCHES_CREATE_SUCCESS,
  WORK_BATCHES_CREATE_FAILURE,
} from '../actions/workBatch';

import {list, entry} from './shared';

export const initialState = {
  ...list.initialState,
  ...entry.initialState,
};

const workBatch = (state = initialState, action) => {
  switch (action.type) {
    case WORK_BATCHES_GET_REQUEST:
      return list.getListRequest(state, action);
    case WORK_BATCHES_GET_SUCCESS:
      return list.getListSuccess(state, action);
    case WORK_BATCHES_GET_FAILURE:
      return list.getListFailure(state, action);
    case WORK_BATCH_TOGGLE_SELECT:
      return list.selectSingle(state, action);
    case WORK_BATCHES_TOGGLE_SELECT_ALL:
      return list.selectAll(state, action);
    case WORK_BATCHES_CREATE_REQUEST:
      return entry.createEntryRequest(state, action);
    case WORK_BATCHES_CREATE_SUCCESS:
      return entry.createEntrySuccess(state, action);
    case WORK_BATCHES_CREATE_FAILURE:
      return entry.createEntryFailure(state, action);
    default:
      return state;
  }
};

export default workBatch;
