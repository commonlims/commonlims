import axios from 'axios';

// Helper function that creates an action creator.
// From: https://redux.js.org/recipes/reducing-boilerplate
export function ac(type, ...argNames) {
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
export const acRequest = resource => {
  return (search = null, groupBy = null, cursor = null) => {
    return {
      type: `GET_${resource}_LIST_REQUEST`,
      search,
      groupBy,
      cursor,
    };
  };
};

export const acSuccess = resource => {
  return (entries, link) => {
    return {
      type: `GET_${resource}_LIST_SUCCESS`,
      entries,
      link,
    };
  };
};

export const acFailure = resource => {
  return err => ({
    type: `GET_${resource}_LIST_FAILURE`,
    message: err,
  });
};

export const acGetList = (resource, url) => {
  return (search, groupBy, cursor) => dispatch => {
    dispatch(acRequest(resource)(search, groupBy, cursor));

    const config = {
      params: {
        search,
        cursor,
      },
    };

    return axios
      .get(url, config)
      .then(res => dispatch(acSuccess(resource)(res.data, res.headers.link)))
      .catch(err => dispatch(acFailure(resource)(err)));
  };
};

export const acSelectPage = resource => {
  return doSelect => {
    return {
      type: `TOGGLE_SELECT_PAGE_OF_${resource}`,
      doSelect,
    };
  };
};

export const acSelect = resource => {
  return (id, doSelect) => {
    return {
      type: `TOGGLE_SELECT_${resource}`,
      id,
      doSelect,
    };
  };
};

export const list = {
  acRequest,
  acSuccess,
  acFailure,
  acGetList,
  acSelect,
  acSelectPage,
};

// Creates all actions required for a regular resource
export const makeResourceActions = (resourceName, getListUrl) => {
  return {
    // Fetching a list
    getListRequest: list.acRequest(resourceName),
    getListSuccess: list.acSuccess(resourceName),
    getListFailure: list.acFailure(resourceName),
    getList: list.acGetList(resourceName, getListUrl),

    // Select entries in the list or pages of it
    select: list.acSelect(resourceName),
    selectPage: list.acSelectPage(resourceName),
  };
};
