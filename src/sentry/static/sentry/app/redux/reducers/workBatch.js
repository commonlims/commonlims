import {
  WORK_BATCHES_GET_REQUEST,
  WORK_BATCHES_GET_SUCCESS,
  WORK_BATCHES_GET_FAILURE,
  WORK_BATCH_TOGGLE_SELECT,
  WORK_BATCHES_TOGGLE_SELECT_ALL,
} from '../actions/workBatch';

const initialState = {
  loading: false,
  errorMessage: null,
  workBatches: [],
};

const workBatchToggleSelect = (workBatches, id) =>
  workBatches.map((ut) => {
    if (ut.id == id) {
      ut.selected = !!!ut.selected;
    }
    return ut;
  });

const workBatchesToggleSelectAll = (workBatches, doSelect) =>
  workBatches.map((ut) => {
    ut.selected = doSelect;
    return ut;
  });

const workBatch = (state = initialState, action) => {
  switch (action.type) {
    case WORK_BATCHES_GET_REQUEST:
      return {
        ...state,
        errorMessage: null,
        loading: true,
      };
    case WORK_BATCHES_GET_SUCCESS: {
      return {
        ...state,
        workBatches: action.workBatches,
        errorMessage: null,
        loading: false,
      };
    }
    case WORK_BATCHES_GET_FAILURE:
      return {
        ...state,
        errorMessage: action.message,
        loading: false,
      };
    case WORK_BATCH_TOGGLE_SELECT:
      return {
        ...state,
        workBatches: workBatchToggleSelect(state.workBatches, action.id),
      };
    case WORK_BATCHES_TOGGLE_SELECT_ALL:
      return {
        ...state,
        workBatches: workBatchesToggleSelectAll(state.workBatches, action.doSelect),
      };
    default:
      return state;
  }
};

export default workBatch;
