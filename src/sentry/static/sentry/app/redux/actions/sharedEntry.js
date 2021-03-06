import axios from 'axios';
import {Client} from 'app/api';

// Helper function that creates an action creator.
// From: https://redux.js.org/recipes/reducing-boilerplate
export function makeActionCreator(type, ...argNames) {
  return function (...args) {
    const action = {type};
    argNames.forEach((arg, index) => {
      action[argNames[index]] = args[index];
    });
    return action;
  };
}

////////////////////////
// Update local changes
const acUpdateLocal = (resource) => {
  return (localChanges) => (dispatch) => {
    dispatch(acUpdateLocalRequest(resource)(localChanges));
  };
};

const acUpdateLocalRequest = (resource) =>
  makeActionCreator(`UPDATE_${resource}_LOCAL_REQUEST`, 'localChanges');

////////////////////////
// Update single resource
const acUpdate = (resource, urlTemplate) => {
  return (org, data) => (dispatch) => {
    dispatch(acUpdateRequest(resource)(data));

    let url = urlTemplate.replace('{org}', org.slug);
    url = url.replace('{id}', data['id']);
    url = url.slice(-1) === '/' ? url : url + '/';
    // use client that sentry is using
    const api = new Client(); // TODO: use axios (must send same headers as Client does).
    api.request(url, {
      method: 'PUT',
      data,
      success: () => {
        dispatch(acUpdateSuccess(resource)(data));
      },
      error: (err) => {
        const message = getErrorMessage(err);
        dispatch(acUpdateFailure(resource)(err.status, message));
      },
    });
    // TODO: uncomment this when clims-465 is completed
    // return axios
    //   .put(url, data)
    //   .then(() => dispatch(acUpdateSuccess(resource)(data)))
    //   .catch((response) => {
    //     const message = getErrorMessage(response.request);
    //     dispatch(acUpdateFailure(resource)(response.request.status, message));
    //   });
  };
};

const acUpdateRequest = (resource) =>
  makeActionCreator(`UPDATE_${resource}_REQUEST`, 'resource');

const acUpdateSuccess = (resource) =>
  makeActionCreator(`UPDATE_${resource}_SUCCESS`, 'resource');

const acUpdateFailure = (resource) =>
  makeActionCreator(`UPDATE_${resource}_FAILURE`, 'statusCode', 'message');

////////////////////////
// Fetch single resource
const acGetRequest = (resource) => makeActionCreator(`GET_${resource}_REQUEST`, 'id');

const acGetSuccess = (resource) =>
  makeActionCreator(`GET_${resource}_SUCCESS`, 'resource');

const acGetFailure = (resource) =>
  makeActionCreator(`GET_${resource}_FAILURE`, 'statusCode', 'message');

const acGet = (resource, urlTemplate) => {
  return (org, id) => (dispatch) => {
    dispatch(acGetRequest(resource)(id));
    let url = urlTemplate.replace('{org}', org.slug);
    url = url.replace('{id}', id);
    url = url.slice(-1) === '/' ? url : url + '/';
    return axios
      .get(url)
      .then((res) => dispatch(acGetSuccess(resource)(res.data)))
      .catch((response) => {
        const message = getErrorMessage(response.request);
        dispatch(acGetFailure(resource)(response.request.status, message));
      });
  };
};

function getErrorMessage(err) {
  return `(${err.statusText}) ${err.responseText}`;
}

export const entryActionCreators = {
  acGet,
  acGetRequest,
  acGetSuccess,
  acGetFailure,
  acUpdate,
  acUpdateRequest,
  acUpdateSuccess,
  acUpdateFailure,
  acUpdateLocal,
  acUpdateLocalRequest,
};

// Creates all actions required for a regular resource
export const makeResourceActions = (resourceName, entryUrl) => {
  return {
    // Get a single resource
    get: acGet(resourceName, entryUrl),
    getRequest: acGetRequest(resourceName),
    getSuccess: acGetSuccess(resourceName),
    getFailure: acGetFailure(resourceName),

    // Update single resource
    update: acUpdate(resourceName, entryUrl),
    updateRequest: acUpdateRequest(resourceName),
    updateSuccess: acUpdateSuccess(resourceName),
    updateFailure: acUpdateFailure(resourceName),
    updateLocal: acUpdateLocal(resourceName),
    updateLocalRequest: acUpdateLocalRequest(resourceName),
  };
};
