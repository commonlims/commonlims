import axios from 'axios';

export const SUBSTANCES_GET_REQUEST = 'SUBSTANCES_GET_REQUEST';
export const SUBSTANCES_GET_SUCCESS = 'SUBSTANCES_GET_SUCCESS';
export const SUBSTANCES_GET_FAILURE = 'SUBSTANCES_GET_FAILURE';
export const SUBSTANCES_TOGGLE_SELECT_ALL = 'SUBSTANCES_TOGGLE_SELECT_ALL';
export const SUBSTANCE_TOGGLE_SELECT = 'SUBSTANCE_TOGGLE_SELECT';

export const SUBSTANCE_GET_REQUEST = 'SUBSTANCE_GET_REQUEST';
export const SUBSTANCE_GET_SUCCESS = 'SUBSTANCE_GET_SUCCESS';
export const SUBSTANCE_GET_FAILURE = 'SUBSTANCE_GET_FAILURE';
export const SUBSTANCE_INVALIDATE = 'SUBSTANCE_INVALIDATE';

export const substancesGetRequest = () => {
  return {
    type: SUBSTANCES_GET_REQUEST,
  };
};

export const substancesGetSuccess = substances => {
  return {
    type: SUBSTANCES_GET_SUCCESS,
    substances,
  };
};

export const substancesGetFailure = err => ({
  type: SUBSTANCES_GET_FAILURE,
  message: err,
});

export const substancesGet = query => dispatch => {
  dispatch(substancesGetRequest());
  return axios
    .get('/api/0/organizations/lab/substances/?query=' + query)
    .then(res => {
      dispatch(substancesGetSuccess(res.data));
    })
    .catch(err => dispatch(substancesGetFailure(err)));
};

export const substanceGetRequest = id => {
  return {
    type: SUBSTANCE_GET_REQUEST,
    id,
  };
};

const shouldFetchSubstance = (state, id) => {
  const substance = state.substance.byIds[id];
  if (!substance) {
    return true;
  } else if (substance.isFetching) {
    return false;
  } else {
    return substance.didInvalidate;
  }
};

export const substanceGetSuccess = substance => ({
  type: SUBSTANCE_GET_SUCCESS,
  substance,
});

export const substanceGetFailure = err => ({
  type: SUBSTANCE_GET_FAILURE,
  message: err,
});

export const substanceInvalidate = () => ({
  type: SUBSTANCE_GET_FAILURE,
});

export const substanceGet = id => dispatch => {
  dispatch(substanceGetRequest(id));
  return axios
    .get(`/api/0/substances/${id}/`)
    .then(res => dispatch(substanceGetSuccess(res.data)))
    .catch(err => dispatch(substanceGetFailure(err)));
};

export const substanceGetIfNeeded = id => {
  return (dispatch, getState) => {
    if (shouldFetchSubstance(getState(), id)) {
      dispatch(substanceGet(id));
    }
  };
};

export const substanceToggleSelect = id => {
  return {
    type: SUBSTANCE_TOGGLE_SELECT,
    id,
  };
};

export const substancesToggleSelectAll = doSelect => {
  return {
    type: SUBSTANCES_TOGGLE_SELECT_ALL,
    doSelect,
  };
};
