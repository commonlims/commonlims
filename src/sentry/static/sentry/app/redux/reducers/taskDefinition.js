import {
  GET_TASK_DEFINITION_REQUEST,
  GET_TASK_DEFINITION_SUCCESS,
  GET_TASK_DEFINITION_FAILURE,
  TOGGLE_SELECT_TASK_DEFINITION,
  TOGGLE_SELECT_PAGE_OF_TASK_DEFINITION,
  GET_TASK_DEFINITION_LIST_REQUEST,
  GET_TASK_DEFINITION_LIST_SUCCESS,
  GET_TASK_DEFINITION_LIST_FAILURE,
} from '../actions/taskDefinition';

import {list, entry} from './shared';

export const initialState = {
  ...list.initialState,
  ...entry.initialState,
};

const taskDefinition = (state = initialState, action) => {
  switch (action.type) {
    case GET_TASK_DEFINITION_LIST_REQUEST:
      return list.getListRequest(state, action);
    case GET_TASK_DEFINITION_LIST_SUCCESS:
      return list.getListSuccess(state, action);
    case GET_TASK_DEFINITION_LIST_FAILURE:
      return list.getListFailure(state, action);
    case TOGGLE_SELECT_TASK_DEFINITION:
      return list.selectSingle(state, action);
    case TOGGLE_SELECT_PAGE_OF_TASK_DEFINITION:
      return list.selectAll(state, action);
    case GET_TASK_DEFINITION_REQUEST:
      return entry.getEntryRequest(state, action);
    case GET_TASK_DEFINITION_SUCCESS:
      return entry.getEntrySuccess(state, action);
    case GET_TASK_DEFINITION_FAILURE:
      return entry.getEntryFailure(state, action);
    default:
      return state;
  }
};

export default taskDefinition;
