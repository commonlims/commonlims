import axios from 'axios';
// import {Client} from 'app/api';

export const WORK_BATCH_DETAILS_GET_REQUEST = 'WORK_BATCH_DETAILS_GET_REQUEST';
export const workBatchDetailsGetRequest = (id) => {
  return {
    type: WORK_BATCH_DETAILS_GET_REQUEST,
    id,
  };
};

export const WORK_BATCH_DETAILS_GET_SUCCESS = 'WORK_BATCH_DETAILS_GET_SUCCESS';
export const workBatchDetailsGetSuccess = (workBatch) => {
  return {
    type: WORK_BATCH_DETAILS_GET_SUCCESS,
    workBatch,
  };
};

export const WORK_BATCH_DETAILS_GET_FAILURE = 'WORK_BATCH_DETAILS_GET_FAILURE';
export const workBatchDetailsGetFailure = (err) => ({
  type: WORK_BATCH_DETAILS_GET_FAILURE,
  message: err,
});

export const getWorkBatchDetails = (org, id) => (dispatch) => {
  dispatch(workBatchDetailsGetRequest(id));
  // A) Fetch the work batch itself and B) fetch the setting for it if we don't already have it
  // TODO: for that kind of thing to work, we need to join the reducers!

  const data = {
    id: 22,
    name: 'Fragment analyzer', // TODO: backend must set this when creating it
    // TODO: Not included in backend yet
    processDefinitionKey: 'clims.plugins.demo.dnaseq.workflows.sequence.SequenceSimple',
    handler: '', // TODO: This we can remove
    extra_fields: '', // TODO: This we can remove
    created_at: '2020-02-22T17:06:11.717759Z',
    updated_at: '2020-02-22T17:06:11.717776Z',
    num_comments: 0,
    status: 0,
    organization: 1,
    files: [
      {
        sha1: 'ea40a664346c0cb7d4326830d76b8ef468a512d7',
        name: '108620_190321_FA_Sample_List.txt',
        dateCreated: '2019-03-08T14:18:01.371Z',
        headers: {
          'Content-Type': 'application/octet-stream',
          Description: 'Sample list',
        },
        id: '30',
        size: 7566,
      },
      {
        sha1: 'ea40a664346c0cb7d4326830d76b8ef468a512d7',
        name: 'quality.csv',
        dateCreated: '2019-03-06T14:32:04.056Z',
        headers: {
          'Content-Type': 'application/octet-stream',
          Description: 'Quality table',
        },
        id: '20',
        size: 7566,
      },
      {
        sha1: 'ea40a664346c0cb7d4326830d76b8ef468a512d7',
        name: 'PDF report',
        dateCreated: '2019-03-06T14:32:04.056Z',
        headers: {
          'Content-Type': 'application/octet-stream',
          Description: 'PDF report from the robot',
        },
        id: '20',
        size: 7566,
      },
      {
        sha1: 'ea40a664346c0cb7d4326830d76b8ef468a512d7',
        name: 'file.bmf',
        dateCreated: '2019-03-06T14:33:16.353Z',
        headers: {
          'Content-Type': 'application/octet-stream',
          Description: 'Robot file (bmf)',
        },
        id: '24',
        size: 7566,
      },
      {
        sha1: 'ea40a664346c0cb7d4326830d76b8ef468a512d7',
        name: 'raw.zip',
        dateCreated: '2019-03-06T14:33:33.306Z',
        headers: {
          'Content-Type': 'application/octet-stream',
          Description: 'Raw data from the robot',
        },
        id: '26',
        size: 7566,
      },
    ],

    subtasks: [{description: 'first do this'}, {description: 'then do that'}],

    // TODO: synch with backend
    transitions: [],
    source: {
      substances: [
        {
          id: 1,
          name: 'sample1',
          location: {
            containerId: 1,
            // NOTE: This is a plate in this case, so we should get row/col from the backend
            row: 1,
            col: 1,
          },
        },
      ],
      // TODO: backend doesn't use dimensions, but that makes sense
      containers: [
        {
          id: 1,
          name: 'container1',
          dimensions: {rows: 8, cols: 12},
          typeName: '64 well plate',
        },
      ],
    },
    target: {
      substances: [],

      // TODO: the backend must decide if it should create an initial container for convenience.
      // Here we assume that it will add one.
      containers: [
        {
          id: -1,
          name: 'something',
          dimensions: {rows: 8, cols: 12},
          typeName: '96 well plate',
        },
      ],
    },

    tabs: [
      {
        title: 'Move samples',
        type: 'Transition',
      },
      {
        title: 'Files',
        type: 'Files',
      },
    ],
  };

  // TODO: hook up with bakend
  // dispatch(getWorkBatchDetailsSuccess(data));

  return axios
    .get(`/api/0/organizations/${org}/work-batch-details/${id}/`)
    .then((res) => dispatch(workBatchDetailsGetSuccess(res.data)))
    .catch((err) => dispatch(workBatchDetailsGetFailure(err)));
};
