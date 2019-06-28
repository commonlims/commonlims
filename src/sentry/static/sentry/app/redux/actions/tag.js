import axios from 'axios';

export const TAGS_GET_REQUEST = 'TAGS_GET_REQUEST';
export const TAGS_GET_SUCCESS = 'TAGS_GET_SUCCESS';
export const TAGS_GET_FAILURE = 'TAGS_GET_FAILURE';

export const tagsGetRequest = () => {
  return {
    type: TAGS_GET_REQUEST,
  };
};

export const tagsGetSuccess = tags => {
  return {
    type: TAGS_GET_SUCCESS,
    tags,
  };
};

export const tagsGetFailure = err => ({
  type: TAGS_GET_FAILURE,
  message: err,
});

export const tagsGet = resourceName => dispatch => {
  dispatch(tagsGetRequest());
  return axios
    .get(`/api/0/organizations/sentry/tags/${resourceName}`)
    .then(res => dispatch(tagsGetSuccess(res.data)))
    .catch(err => dispatch(tagsGetFailure(err)));
};
