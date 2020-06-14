// Auto-generated with `lims django codegen --redux`

import axios from 'axios';

////// List of TaskDefinition
export const GET_TASK_DEFINITION_LIST_REQUEST = 'GET_TASK_DEFINITION_LIST_REQUEST';
export const getTaskDefinitionListRequest = () => {
  return {
    type: GET_TASK_DEFINITION_LIST_REQUEST,
  };
};

export const GET_TASK_DEFINITION_LIST_SUCCESS = 'GET_TASK_DEFINITION_LIST_SUCCESS';
export const getTaskDefinitionListSuccess = entries => {
  return {
    type: GET_TASK_DEFINITION_LIST_SUCCESS,
    entries,
  };
};

export const GET_TASK_DEFINITION_LIST_FAILURE = 'GET_TASK_DEFINITION_LIST_FAILURE';
export const getTaskDefinitionListFailure = err => ({
  type: GET_TASK_DEFINITION_LIST_FAILURE,
  message: err,
});

export const getTaskDefinitionList = org => dispatch => {
  dispatch(getTaskDefinitionListRequest());

  const config = {
    params: {},
  };

  return axios
    .get(`/api/0/organizations/${org.slug}/task-definitions/`, config)
    .then(res => dispatch(getTaskDefinitionListSuccess(res.data)))
    .catch(err => dispatch(getTaskDefinitionListFailure(err)));
};

////// Selection in a list of TaskDefinition
export const TOGGLE_SELECT_TASK_DEFINITION = 'TOGGLE_SELECT_TASK_DEFINITION';
export const toggleSelectTaskDefinition = id => {
  return {
    type: TOGGLE_SELECT_TASK_DEFINITION,
    id,
  };
};

export const TOGGLE_SELECT_PAGE_OF_TASK_DEFINITION =
  'TOGGLE_SELECT_PAGE_OF_TASK_DEFINITION';
export const toggleSelectPageOfTaskDefinition = doSelect => {
  return {
    type: TOGGLE_SELECT_PAGE_OF_TASK_DEFINITION,
    doSelect,
  };
};

////// Fetch a single TaskDefinition
export const GET_TASK_DEFINITION_REQUEST = 'GET_TASK_DEFINITION_REQUEST';
export const getTaskDefinitionRequest = () => {
  return {
    type: GET_TASK_DEFINITION_REQUEST,
  };
};

export const GET_TASK_DEFINITION_SUCCESS = 'GET_TASK_DEFINITION_SUCCESS';
export const getTaskDefinitionSuccess = entry => {
  return {
    type: GET_TASK_DEFINITION_SUCCESS,
    entry,
  };
};

export const GET_TASK_DEFINITION_FAILURE = 'GET_TASK_DEFINITION_FAILURE';
export const getTaskDefinitionFailure = err => ({
  type: GET_TASK_DEFINITION_FAILURE,
  message: err,
});

export const getTaskDefinition = (
  org,
  processDefinitionKey,
  taskDefinitionKey
) => dispatch => {
  dispatch(getTaskDefinitionRequest());

  const params = {
    processDefinitionKey,
    taskDefinitionKey,
  };
  return axios
    .get(`/api/0/organizations/${org.slug}/task-definitions/`, {params})
    .then(res => dispatch(getTaskDefinitionSuccess(res.data[0])))
    .catch(err => dispatch(getTaskDefinitionFailure(err)));
};

// Default dispatchToProps mapping for all actions created here, 1-1 mapping for all params
export const mapTaskDefinitionDispatchToProps = dispatch => ({
  getTaskDefinition: (org, processDefinitionKey, taskDefinitionKey) =>
    dispatch(getTaskDefinition(org, processDefinitionKey, taskDefinitionKey)),
  getTaskDefinitionList: org => dispatch(getTaskDefinitionList(org)),
});
