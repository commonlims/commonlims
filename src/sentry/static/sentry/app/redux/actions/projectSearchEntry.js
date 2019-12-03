import axios from 'axios';

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
  axios
    .get('/api/0/organizations/lab/projects/?query=' + query)
    .then(res => {
      const formattedData = res.data.reduce(function(map, project) {
        map[project.id] = {
          id: project.id,
          name: project.name,
          pi: project.properties.pi.value,
        };
        return map;
      }, {});
      dispatch(projectSearchEntriesGetSuccess(formattedData));
    })
    .catch(err => dispatch(projectSearchEntriesGetFailure(err)));
};
