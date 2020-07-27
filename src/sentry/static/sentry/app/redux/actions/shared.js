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
  makeActionCreator(`GET_${resource}_LIST_REQUEST`, 'search', 'groupBy', 'cursor');

const acGetListSuccess = (resource) =>
  makeActionCreator(`GET_${resource}_LIST_SUCCESS`, 'entries', 'link');

const acGetListFailure = (resource) =>
  makeActionCreator(`GET_${resource}_LIST_FAILURE`, 'message');

const acGetList = (resource, url) => {
  return (search, groupBy, cursor) => (dispatch) => {
    dispatch(acGetListRequest(resource)(search, groupBy, cursor));

    const config = {
      params: {
        search,
        cursor,
      },
    };

    return axios
      .get(url, config)
      .then((res) => dispatch(acGetListSuccess(resource)(res.data, res.headers.link)))
      .catch((err) => dispatch(acGetListFailure(resource)(err)));
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
  makeActionCreator(`CREATE_${resource}_FAILURE`, 'message');

const acCreate = (org, data, redirect) => (dispatch) => {
  dispatch(workBatchesCreateRequest());

  const api = new Client();

  api.request(`/api/0/organizations/${org.slug}/work-batches/`, {
    method: 'POST',
    data,
    success: (res) => {
      dispatch(workBatchesCreateSuccess(res.workBatch));
      const createdId = res.workBatch.id;
      if (redirect) {
        browserHistory.push(`/${org.slug}/workbatches/${createdId}/`);
      }
    },
    error: (err) => {
      dispatch(workBatchesCreateFailure(err));
    },
  });
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
};

// Creates all actions required for a regular resource
export const makeResourceActions = (resourceName, getListUrl, createUrl) => {
  return {
    // Fetching a list
    getListRequest: acGetListRequest(resourceName),
    getListSuccess: acGetListSuccess(resourceName),
    getListFailure: acGetListFailure(resourceName),
    getList: acGetList(resourceName, getListUrl),

    // Select entries in the list or pages of it
    select: acSelect(resourceName),
    selectPage: acSelectPage(resourceName),

    // Create entries
    create: acCreate(resourceName, createUrl),
    createRequest: acCreateRequest(resourceName),
    createSuccess: acCreateSuccess(resourceName),
    createFailure: acCreateFailure(resourceName),
  };
};
