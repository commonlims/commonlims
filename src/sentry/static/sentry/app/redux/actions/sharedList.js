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

// Lists are either on organization level (e.g. organizations/{org}/available-work/)
// or they are lists under some resource (e.g. work-definitions/{id}/available-work/).
// For orgs use key='org', otherwise use key='id'
const acGetList = (resource, urlTemplate, key = 'org') => {
  return (orgSlugOrResourceId, search, groupBy, cursor, getParams) => (dispatch) => {
    dispatch(acGetListRequest(resource)(search, groupBy, cursor, getParams));
    const url = urlTemplate.replace('{' + key + '}', orgSlugOrResourceId);
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

function getErrorMessage(err) {
  return `(${err.statusText}) ${err.responseText}`;
}

export const listActionCreators = {
  acGetList,
  acGetListRequest,
  acGetListSuccess,
  acGetListFailure,
  acSelect,
  acSelectPage,
};

// Creates all actions required for a regular resource
export const makeResourceActions = (resourceName, listUrl, getListKey = 'org') => {
  return {
    // Fetching a list
    getListRequest: acGetListRequest(resourceName),
    getListSuccess: acGetListSuccess(resourceName),
    getListFailure: acGetListFailure(resourceName),
    getList: acGetList(resourceName, listUrl, getListKey),

    // Select entries in the list or pages of it
    select: acSelect(resourceName),
    selectPage: acSelectPage(resourceName),
  };
};
