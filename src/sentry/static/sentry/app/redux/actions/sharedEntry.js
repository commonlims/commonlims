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
// Update single resource
const acUpdate = (resource, urlTemplate) => {
  return (org, data) => (dispatch) => {
    dispatch(acUpdateRequest(resource)(data));

    let url = urlTemplate.replace('{org}', org.slug);
    url = url.replace('{id}', data['id'] + '/');
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
  makeActionCreator(`UPDATE_${resource}_REQUEST`, 'entry');

const acUpdateSuccess = (resource) =>
  makeActionCreator(`UPDATE_${resource}_SUCCESS`, 'entry');

const acUpdateFailure = (resource) =>
  makeActionCreator(`UPDATE_${resource}_FAILURE`, 'statusCode', 'message');

////////////////////////
// Fetch single resource
const acGetRequest = (resource) => makeActionCreator(`GET_${resource}_REQUEST`, 'id');

const acGetSuccess = (resource) => makeActionCreator(`GET_${resource}_SUCCESS`, 'entry');

const acGetFailure = (resource) =>
  makeActionCreator(`GET_${resource}_FAILURE`, 'statusCode', 'message');

const acGet = (resource, urlTemplate) => {
  return (org, id) => (dispatch) => {
    dispatch(acGetRequest(resource)(id));
    let url = urlTemplate.replace('{org}', org.slug);
    url = url.replace('{id}', id + '/');
    return axios
      .get(url)
      .then((res) => dispatch(acGetSuccess(resource)(res.data)))
      .catch((response) => {
        const message = getErrorMessage(response.request);
        dispatch(acGetFailure(resource)(response.request.status, message));
      });
  };
};

// Create actions
const acCreateRequest = (resource) =>
  makeActionCreator(`CREATE_${resource}_REQUEST`, 'entry');

const acCreateSuccess = (resource) =>
  makeActionCreator(`CREATE_${resource}_SUCCESS`, 'entry');

const acCreateFailure = (resource) =>
  makeActionCreator(`CREATE_${resource}_FAILURE`, 'statusCode', 'message');

const acCreate = (resource, urlTemplate) => {
  return (org, data, onSuccess) => (dispatch) => {
    dispatch(acCreateRequest(resource)(data));

    const url = urlTemplate.replace('{org}', org.slug);
    // use client that sentry is using
    const api = new Client(); // TODO: use axios (must send same headers as Client does).
    api.request(url, {
      method: 'POST',
      data,
      success: (response) => {
        dispatch(acCreateSuccess(resource)(data));

        // TODO: This is to handle redirects. There is perhaps a better
        // pattern for this using redux only?
        if (onSuccess) {
          onSuccess(response);
        }
      },
      error: (err) => {
        const message = getErrorMessage(err);
        dispatch(acCreateFailure(resource)(err.status, message));
      },
    });
    // TODO: uncomment this when clims-465 is completed
    // return axios
    //   .post(url, data)
    //   .then(() => dispatch(acCreateSuccess(resource)(data)))
    //   .catch((response) => {
    //     const message = getErrorMessage(response.request);
    //     dispatch(acCreateFailure(resource)(response.request.status, message));
    //   });
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
  acCreate,
  acCreateRequest,
  acCreateSuccess,
  acCreateFailure,
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

    // Create entries
    create: acCreate(resourceName, entryUrl),
    createRequest: acCreateRequest(resourceName),
    createSuccess: acCreateSuccess(resourceName),
    createFailure: acCreateFailure(resourceName),
  };
};
