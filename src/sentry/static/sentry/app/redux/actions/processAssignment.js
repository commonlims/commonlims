import {t} from 'app/locale';
import {Client} from 'app/api';

// Assigning substances to processes.
// TODO-nomerge: Rename actions to processAssignments
// TODO-nomerge: Use the wizard
// TODO-nomerge: Wizard should use makeActionCreator
export const PROCESS_ASSIGN_SELECT_PRESET = 'PROCESS_ASSIGN_SELECT_PRESET';
export const processAssignSelectPreset = preset => {
  return {
    type: PROCESS_ASSIGN_SELECT_PRESET,
    preset,
  };
};

export const PROCESS_ASSIGN_SELECT_PROCESS_DEF = 'PROCESS_ASSIGN_SELECT_PROCESS_DEF';
export const processAssignSelectProcess = processDefinitionId => {
  return {
    type: PROCESS_ASSIGN_SELECT_PROCESS_DEF,
    processDefinitionId,
  };
};

export const PROCESS_ASSIGN_SET_VARIABLE = 'PROCESS_ASSIGN_SET_VARIABLE';
export const processAssignSetVariable = (key, value) => {
  return {
    type: PROCESS_ASSIGN_SET_VARIABLE,
    key,
    value,
  };
};

// Requested a POST TO `process-assignments`
export const PROCESS_ASSIGNMENTS_POST_REQUEST = 'PROCESS_ASSIGNMENTS_POST_REQUEST';
export const processAssignmentsPostRequest = () => {
  return {
    type: PROCESS_ASSIGNMENTS_POST_REQUEST,
    msg: t('Assigning to process...'),
  };
};

// Successfully POSTed to `process-assignments`
export const PROCESS_ASSIGNMENTS_POST_SUCCESS = 'PROCESS_ASSIGNMENTS_POST_SUCCESS';
export const processAssignmentsPostSuccess = response => {
  return {
    type: PROCESS_ASSIGNMENTS_POST_SUCCESS,
    response,
  };
};

// Error while POSTing to `process-assignments`
export const PROCESS_ASSIGNMENTS_POST_FAILURE = 'PROCESS_ASSIGNMENTS_POST_FAILURE';
export const processAssignmentsPostFailure = err => ({
  type: PROCESS_ASSIGNMENTS_POST_FAILURE,
  message: err,
});

export const processAssignmentsPost = (
  definitionId,
  variables,
  substances,
  containers,
  org
) => dispatch => {
  dispatch(processAssignmentsPostRequest());
  const api = new Client(); // TODO: use axios (must send same headers as Client does).

  const data = {
    definitionId,
    variables,
    substances,
    containers,
  };

  api.request(`/api/0/organizations/${org}/process-assignments/`, {
    method: 'POST',
    data,
    success: res => {
      dispatch(processAssignmentsPostSuccess(res));
    },
    error: err => {
      dispatch(processAssignmentsPostFailure(err));
    },
  });
};
