import axios from 'axios';

// Helper function that creates an action creator.
// From: https://redux.js.org/recipes/reducing-boilerplate
export function makeActionCreator(type, ...argNames) {
  return function(...args) {
    const action = {type};
    argNames.forEach((arg, index) => {
      action[argNames[index]] = args[index];
    });
    return action;
  };
}

// Action creators for standard actions

// List actions:
export const acGetListRequest = resource =>
  makeActionCreator(`GET_${resource}_LIST_REQUEST`, 'search', 'groupBy', 'cursor');

export const acGetListSuccess = resource =>
  makeActionCreator(`GET_${resource}_LIST_SUCCESS`, 'entries', 'link');

export const acGetListFailure = resource =>
  makeActionCreator(`GET_${resource}_LIST_FAILURE`, 'message');

export const acGetList = (resource, url) => {
  return (search, groupBy, cursor) => dispatch => {
    dispatch(acGetListRequest(resource)(search, groupBy, cursor));

    const config = {
      params: {
        search,
        cursor,
      },
    };

    return axios
      .get(url, config)
      .then(res => dispatch(acGetListSuccess(resource)(res.data, res.headers.link)))
      .catch(err => dispatch(acGetListFailure(resource)(err)));
  };
};

export const acSelectPage = resource =>
  makeActionCreator(`SELECT_PAGE_OF_${resource}`, 'doSelect');

export const acSelect = resource =>
  makeActionCreator(`SELECT_${resource}`, 'id', 'doSelect');

export const resourceActionCreators = {
  acGetListRequest,
  acGetListSuccess,
  acGetListFailure,
  acGetList,
  acSelect,
  acSelectPage,
};

// Creates all actions required for a regular resource
export const makeResourceActions = (resourceName, getListUrl) => {
  return {
    // Fetching a list
    getListRequest: acGetListRequest(resourceName),
    getListSuccess: acGetListSuccess(resourceName),
    getListFailure: acGetListFailure(resourceName),
    getList: acGetList(resourceName, getListUrl),

    // Select entries in the list or pages of it
    select: acSelect(resourceName),
    selectPage: acSelectPage(resourceName),
  };
};
