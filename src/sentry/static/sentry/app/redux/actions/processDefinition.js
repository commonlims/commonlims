// Auto-generated with `lims django codegen --redux`

import axios from 'axios';

////// List of ProcessDefinition
export const GET_PROCESS_DEFINITION_LIST_REQUEST = 'GET_PROCESS_DEFINITION_LIST_REQUEST';
export const getProcessDefinitionListRequest = () => {
  return {
    type: GET_PROCESS_DEFINITION_LIST_REQUEST,
  };
};

export const GET_PROCESS_DEFINITION_LIST_SUCCESS = 'GET_PROCESS_DEFINITION_LIST_SUCCESS';
export const getProcessDefinitionListSuccess = entries => {
  return {
    type: GET_PROCESS_DEFINITION_LIST_SUCCESS,
    entries,
  };
};

export const GET_PROCESS_DEFINITION_LIST_FAILURE = 'GET_PROCESS_DEFINITION_LIST_FAILURE';
export const getProcessDefinitionListFailure = err => ({
  type: GET_PROCESS_DEFINITION_LIST_FAILURE,
  message: err,
});

export const getProcessDefinitionList = () => dispatch => {
  dispatch(getProcessDefinitionListRequest());

  const config = {
    params: {
    }
  };

  return axios
    .get(`/api/0/process-definitions/`, config)
    .then(res => dispatch(getProcessDefinitionListSuccess(res.data)))
    .catch(err => dispatch(getProcessDefinitionListFailure(err)));
};

////// Selection in a list of ProcessDefinition
export const TOGGLE_SELECT_PROCESS_DEFINITION = 'TOGGLE_SELECT_PROCESS_DEFINITION';
export const toggleSelectProcessDefinition = id => {
  return {
    type: TOGGLE_SELECT_PROCESS_DEFINITION,
    id,
  };
};

export const TOGGLE_SELECT_PAGE_OF_PROCESS_DEFINITION = 'TOGGLE_SELECT_PAGE_OF_PROCESS_DEFINITION';
export const toggleSelectPageOfProcessDefinition = doSelect => {
  return {
    type: TOGGLE_SELECT_PAGE_OF_PROCESS_DEFINITION,
    doSelect,
  };
};

////// Fetch a single ProcessDefinition
export const GET_PROCESS_DEFINITION_REQUEST = 'GET_PROCESS_DEFINITION_REQUEST';
export const getProcessDefinitionRequest = () => {
  return {
    type: GET_PROCESS_DEFINITION_REQUEST,
  };
};

export const GET_PROCESS_DEFINITION_SUCCESS = 'GET_PROCESS_DEFINITION_SUCCESS';
export const getProcessDefinitionSuccess = entry => {
  return {
    type: GET_PROCESS_DEFINITION_SUCCESS,
    entry,
  };
};

export const GET_PROCESS_DEFINITION_FAILURE = 'GET_PROCESS_DEFINITION_FAILURE';
export const getProcessDefinitionFailure = err => ({
  type: GET_PROCESS_DEFINITION_FAILURE,
  message: err,
});

export const getProcessDefinition = id => dispatch => {
  dispatch(getProcessDefinitionRequest());

  const params = {
  };
  return axios
    .get(`/api/0/process-definitions/${id}`, {params})
    .then(res => dispatch(getProcessDefinitionSuccess(res.data)))
    .catch(err => dispatch(getProcessDefinitionFailure(err)));
};

// Default dispatchToProps mapping for all actions created here, 1-1 mapping for all params
export const mapProcessDefinitionDispatchToProps = dispatch => ({
  getProcessDefinition: id =>
    dispatch(getProcessDefinition(id)),
  getProcessDefinitionList: () =>
    dispatch(getProcessDefinitionList()),
});
