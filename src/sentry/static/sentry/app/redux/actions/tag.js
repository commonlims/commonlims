// TODO: uncomment this when fixing CLIMS-202
// import axios from 'axios';

export const TAGS_GET_REQUEST = 'TAGS_GET_REQUEST';
export const TAGS_GET_SUCCESS = 'TAGS_GET_SUCCESS';
export const TAGS_GET_FAILURE = 'TAGS_GET_FAILURE';

export const tagsGetRequest = () => {
  return {
    type: TAGS_GET_REQUEST,
  };
};

export const tagsGetSuccess = (tags) => {
  return {
    type: TAGS_GET_SUCCESS,
    tags,
  };
};

export const tagsGetFailure = (err) => ({
  type: TAGS_GET_FAILURE,
  message: err,
});

// TODO: this list should preferably be managed by the backend/API. See: CLIMS-202
// If the frontend will continue to manage this list for some reason, you will need
// some utility methods for getMemberListStoreUsernames() to work. See tagStore.jsx.
const tags = {
  workBatch: {
    is: {
      key: 'is',
      name: 'Status',
      values: ['resolved', 'unresolved', 'ignored', 'assigned', 'unassigned'],
      predefined: true,
    },

    assigned: {
      key: 'assigned',
      name: 'Assigned To',
      values: [], // getMemberListStoreUsernames(),
      predefined: true,
    },

    bookmarks: {
      key: 'bookmarks',
      name: 'Bookmarked By',
      values: [], // getMemberListStoreUsernames(),
      predefined: true,
    },

    process: {
      key: 'process',
      name: 'Process',
      values: [],
      predefined: false,
    },

    task: {
      key: 'task-type',
      name: 'Task type',
      values: [],
      predefined: false,
    },

    created: {
      key: 'created',
      name: 'Created',
      values: [
        '-1h',
        '-1d',
        '2018-01-02',
        '>=2018-01-02T01:00:00',
        '<2018-01-02T02:00:00',
      ],
      predefined: true,
    },

    has: {
      key: 'has',
      name: 'Has Tag',
      values: [],
      predefined: true,
    },
  },
};

export const tagsGet = (resourceName) => (dispatch) => {
  dispatch(tagsGetRequest());

  // TODO: replace with the API call once CLIMS-202 is complete
  return Promise.resolve().then(dispatch(tagsGetSuccess(tags[resourceName])));

  /*return axios
    .get(`/api/0/organizations/sentry/tags/${resourceName}`)
    .then(res => dispatch(tagsGetSuccess(res.data)))
    .catch(err => dispatch(tagsGetFailure(err)));*/
};
