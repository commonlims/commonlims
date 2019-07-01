// TODO: uncomment these when fixing CLIMS-202 and CLIMS-203
// import axios from 'axios';
// import MemberListStore from 'app/stores/memberListStore';

export const TAGS_GET_REQUEST = 'TAGS_GET_REQUEST';
export const TAGS_GET_SUCCESS = 'TAGS_GET_SUCCESS';
export const TAGS_GET_FAILURE = 'TAGS_GET_FAILURE';

export const tagsGetRequest = () => {
  return {
    type: TAGS_GET_REQUEST,
  };
};

export const tagsGetSuccess = tags => {
  return {
    type: TAGS_GET_SUCCESS,
    tags,
  };
};

export const tagsGetFailure = err => ({
  type: TAGS_GET_FAILURE,
  message: err,
});

// Note: these are utility methods ported from old Sentry code
// Their use is pending CLIMS-203
/*
const uuidPattern = /[0-9a-f]{32}$/;

const getUsername = ({isManaged, username, email}) => {
  // Users created via SAML receive unique UUID usernames. Use
  // their email in these cases, instead.
  if (username && uuidPattern.test(username)) {
    return email;
  } else {
    return !isManaged && username ? username : email;
  }
};

const getMemberListStoreUsernames = () => {
  return MemberListStore.getAll().map(getUsername);
};
*/

// TODO: this list should be managed by the backend/API. See: CLIMS-202
const tags = {
  userTask: {
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

export const tagsGet = resourceName => dispatch => {
  dispatch(tagsGetRequest());

  // TODO: replace with the API call once CLIMS-202 is complete
  return Promise.resolve().then(dispatch(tagsGetSuccess(tags[resourceName])));

  /*return axios
    .get(`/api/0/organizations/sentry/tags/${resourceName}`)
    .then(res => dispatch(tagsGetSuccess(res.data)))
    .catch(err => dispatch(tagsGetFailure(err)));*/
};
