import axios from 'axios';

export const PROJECT_SEARCH_ENTRIES_GET_REQUEST = 'PROJECT_SEARCH_ENTRIES_GET_REQUEST';
export const PROJECT_SEARCH_ENTRIES_GET_SUCCESS = 'PROJECT_SEARCH_ENTRIES_GET_SUCCESS';
export const PROJECT_SEARCH_ENTRIES_GET_FAILURE = 'PROJECT_SEARCH_ENTRIES_GET_FAILURE';

export const projectSearchEntriesGetRequest = (search, groupBy, cursor) => {
  return {
    type: PROJECT_SEARCH_ENTRIES_GET_REQUEST,
    search,
    groupBy,
    cursor,
  };
};

export const projectSearchEntriesGetSuccess = (projectSearchEntries, link) => {
  return {
    type: PROJECT_SEARCH_ENTRIES_GET_SUCCESS,
    projectSearchEntries,
    link,
  };
};

export const projectSearchEntriesGetFailure = err => ({
  type: PROJECT_SEARCH_ENTRIES_GET_FAILURE,
  message: err,
});

export const projectSearchEntriesGet = (search, groupBy, cursor) => dispatch => {
  dispatch(projectSearchEntriesGetRequest(search, groupBy, cursor));

  const request = {
    params: {search, cursor},
  };

  axios
    .get('/api/0/organizations/lab/projects/', request)
    .then(res => {
      const formattedData = res.data.reduce(function(map, project) {
        map[project.id] = {
          id: project.id,
          name: project.name,
          pi: project.properties.pi.value,
        };
        return map;
      }, {});
      dispatch(projectSearchEntriesGetSuccess(formattedData, res.headers.link));
    })
    .catch(err => dispatch(projectSearchEntriesGetFailure(err)));
};
