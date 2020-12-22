import {SampleLocation} from 'app/components/sampleTransitioner/sampleLocation';
import {Sample} from 'app/components/sampleTransitioner/sample';
import {
  WORK_BATCH_DETAILS_GET_REQUEST,
  WORK_BATCH_DETAILS_GET_SUCCESS,
  WORK_BATCH_DETAILS_GET_FAILURE,
} from '../actions/workBatchDetails_old';

const initialState = {
  loading: false,
  errorMessage: null,
  workBatch: null,
};

const workBatchDetails = (state = initialState, action) => {
  switch (action.type) {
    case WORK_BATCH_DETAILS_GET_REQUEST:
      return {
        ...state,
        errorMessage: null,
        loading: true,
      };
    case WORK_BATCH_DETAILS_GET_SUCCESS: {
      return {
        ...state,
        errorMessage: null,
        loading: false,
        workBatch: action.workBatch,
      };
    }
    case WORK_BATCH_DETAILS_GET_FAILURE: {
      return {
        ...state,
        errorMessage: action.message,
        loading: false,
      };
    }
    default:
      return state;
  }
};

export default workBatchDetails;
