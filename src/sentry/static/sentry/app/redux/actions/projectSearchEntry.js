//import axios from 'axios';

export const PROJECT_SEARCH_ENTRIES_GET_REQUEST = 'PROJECT_SEARCH_ENTRIES_GET_REQUEST';
export const PROJECT_SEARCH_ENTRIES_GET_SUCCESS = 'PROJECT_SEARCH_ENTRIES_GET_SUCCESS';
export const PROJECT_SEARCH_ENTRIES_GET_FAILURE = 'PROJECT_SEARCH_ENTRIES_GET_FAILURE';

export const projectSearchEntriesGetRequest = (query, groupBy) => {
  return {
    type: PROJECT_SEARCH_ENTRIES_GET_REQUEST,
    query,
    groupBy,
  };
};

export const projectSearchEntriesGetSuccess = projectSearchEntries => {
  return {
    type: PROJECT_SEARCH_ENTRIES_GET_SUCCESS,
    projectSearchEntries,
  };
};

export const projectSearchEntriesGetFailure = err => ({
  type: PROJECT_SEARCH_ENTRIES_GET_FAILURE,
  message: err,
});

export const projectSearchEntriesGet = (query, groupBy) => dispatch => {
  dispatch(projectSearchEntriesGetRequest(query, groupBy));
  // TODO Remove hard coding here and fetch project data from backend.
  const data = {
    1: {
      id: 1,
      name: 'test project 1',
      pi: 'A-C Syvänen',
    },
    2: {
      id: 2,
      name: 'test project 2',
      pi: 'J. Nordlund',
    },
  };
  dispatch(projectSearchEntriesGetSuccess(data));
  //return axios
  //  .get('/api/0/organizations/lab/projects/?query=' + query)
  //  .then(res => {
  //    // TODO: keep the state outside of these
  //    for (const entry of res.data) {
  //      setInitialViewState(groupBy, entry);
  //    }
  //    dispatch(projectSearchEntriesGetSuccess(res.data));
  //  })
  //  .catch(err => dispatch(projectSearchEntriesGetFailure(err)));
};
