import axios from 'axios';

export const SAVED_SEARCHES_GET_REQUEST = 'SAVED_SEARCHES_GET_REQUEST';
export const SAVED_SEARCHES_GET_SUCCESS = 'SAVED_SEARCHES_GET_SUCCESS';
export const SAVED_SEARCHES_GET_FAILURE = 'SAVED_SEARCHES_GET_FAILURE';

export const savedSearchesGetRequest = () => {
  return {
    type: SAVED_SEARCHES_GET_REQUEST,
  };
};

export const savedSearchesGetSuccess = (savedSearches) => {
  return {
    type: SAVED_SEARCHES_GET_SUCCESS,
    savedSearches,
  };
};

export const savedSearchesGetFailure = (err) => ({
  type: SAVED_SEARCHES_GET_FAILURE,
  message: err,
});

export const savedSearchesGet = () => (dispatch) => {
  dispatch(savedSearchesGetRequest());
  return axios
    .get('/api/0/organizations/lab/saved-searches/')
    .then((res) => dispatch(savedSearchesGetSuccess(res.data)))
    .catch((err) => dispatch(savedSearchesGetFailure(err)));
};
