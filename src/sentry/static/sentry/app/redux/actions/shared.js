import axios from 'axios';
import {Client} from 'app/api';

// Helper function that creates an action creator.
// From: https://redux.js.org/recipes/reducing-boilerplate
export function ac(type, ...argNames) {
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
  ac(`GET_${resource}_LIST_REQUEST`, 'search', 'groupBy', 'cursor');

const acGetListSuccess = (resource) =>
  ac(`GET_${resource}_LIST_SUCCESS`, 'entries', 'link');

const acGetListFailure = (resource) =>
  ac(`GET_${resource}_LIST_FAILURE`, 'message');

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
  ac(`SELECT_PAGE_OF_${resource}`, 'doSelect');

const acSelect = (resource) => ac(`SELECT_${resource}`, 'id', 'doSelect');

// Create actions
const acCreateRequest = (resource) =>
  ac(`CREATE_${resource}_REQUEST`, 'entry');

const acCreateSuccess = (resource) =>
  ac(`CREATE_${resource}_SUCCESS`, 'entry');

const acCreateFailure = (resource) =>
  ac(`CREATE_${resource}_FAILURE`, 'message');

const acCreate = (resource, urlTemplate) => {

  return (org, data, redirect) => (dispatch) => {
    dispatch(acCreateRequest(resource)());

    const api = new Client();
    console.log('ORIGINAL url: ' + urlTemplate);
    const url = urlTemplate.replace('{org}', org.slug);
    console.log('MODIFIED url: ' + url);

    api.request(url, {
      method: 'POST',
      data,
      success: (res) => {
        dispatch(acCreateSuccess(resource)(res.workBatch));
        const createdId = res.workBatch.id;
        if (redirect) {
          browserHistory.push(`/${org.slug}/workbatches/${createdId}/`);  // TODO-NOCOMMIT: configurable in creator
        }
      },
      error: (err) => {
        dispatch(acCreateFailure(resource)(err));
      },
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
};

// Creates all actions required for a regular resource
export const makeResourceActions = (resourceName, listUrl) => {
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
  };
};
