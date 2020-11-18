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

// Action creators for standard actions

// List actions:
const acGetListRequest = (resource) =>
  makeActionCreator(
    `GET_${resource}_LIST_REQUEST`,
    'search',
    'groupBy',
    'cursor',
    'getParams'
  );

const acGetListSuccess = (resource) =>
  makeActionCreator(`GET_${resource}_LIST_SUCCESS`, 'entries', 'link');

const acGetListFailure = (resource) =>
  makeActionCreator(`GET_${resource}_LIST_FAILURE`, 'statusCode', 'message');

const acGetList = (resource, urlTemplate) => {
  return (org, search, groupBy, cursor, getParams) => (dispatch) => {
    dispatch(acGetListRequest(resource)(search, groupBy, cursor, getParams));

    const url = urlTemplate.replace('{org}', org.slug);
    const config = {
      params: {
        ...getParams,
        search,
        cursor,
      },
    };

    return axios
      .get(url, config)
      .then((res) => dispatch(acGetListSuccess(resource)(res.data, res.headers.link)))
      .catch((response) => {
        const message = getErrorMessage(response.request);
        dispatch(acGetListFailure(resource)(response.request.status, message));
      });
  };
};

// Selection actions
const acSelectPage = (resource) =>
  makeActionCreator(`SELECT_PAGE_OF_${resource}`, 'doSelect');

const acSelect = (resource) => makeActionCreator(`SELECT_${resource}`, 'id', 'doSelect');

// Create actions
const acCreateRequest = (resource) =>
  makeActionCreator(`CREATE_${resource}_REQUEST`, 'entry');

const acCreateSuccess = (resource) =>
  makeActionCreator(`CREATE_${resource}_SUCCESS`, 'entry');

const acCreateFailure = (resource) =>
  makeActionCreator(`CREATE_${resource}_FAILURE`, 'statusCode', 'message');

const acCreate = (resource, urlTemplate) => {
  return (org, data) => (dispatch) => {
    dispatch(acCreateRequest(resource)(data));

    const url = urlTemplate.replace('{org}', org.slug);
    // use client that sentry is using
    const api = new Client(); // TODO: use axios (must send same headers as Client does).
    api.request(url, {
      method: 'POST',
      data,
      success: () => {
        dispatch(acCreateSuccess(resource)(data));
      },
      error: (err) => {
        const message = getErrorMessage(err);
        dispatch(acCreateFailure(resource)(err.status, message));
      },
    });
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
        console.log('ac udpate');
        console.log(err);
        const message = getErrorMessage(err);
        dispatch(acUpdateFailure(resource)(err.status, message));
      },
    });
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

export const resourceActionCreators = {
  acGetList,
  acGetListRequest,
  acGetListSuccess,
  acGetListFailure,
  acSelect,
  acSelectPage,
  acCreate,
  acCreateRequest,
  acCreateSuccess,
  acCreateFailure,
  acGet,
  acGetRequest,
  acGetSuccess,
  acGetFailure,
  acUpdate,
  acUpdateRequest,
  acUpdateSuccess,
  acUpdateFailure,
};

// Creates all actions required for a regular resource
export const makeResourceActions = (resourceName, listUrl, entryUrl) => {
  return {
    // Fetching a list
    getListRequest: acGetListRequest(resourceName),
    getListSuccess: acGetListSuccess(resourceName),
    getListFailure: acGetListFailure(resourceName),
    getList: acGetList(resourceName, listUrl),

    // Select entries in the list or pages of it
    select: acSelect(resourceName),
    selectPage: acSelectPage(resourceName),

    // Create entries
    create: acCreate(resourceName, listUrl),
    createRequest: acCreateRequest(resourceName),
    createSuccess: acCreateSuccess(resourceName),
    createFailure: acCreateFailure(resourceName),

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
  };
};
