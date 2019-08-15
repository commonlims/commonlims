import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import moxios from 'moxios';

import {
  WORK_BATCHES_GET_REQUEST,
  WORK_BATCHES_GET_SUCCESS,
  WORK_BATCHES_GET_FAILURE,
  WORK_BATCHES_TOGGLE_SELECT_ALL,
  WORK_BATCH_TOGGLE_SELECT,
  workBatchesGetRequest,
  workBatchesGetSuccess,
  workBatchesGetFailure,
  workBatchesGet,
  workBatchToggleSelect,
  workBatchesToggleSelectAll,
} from 'app/redux/actions/workBatch';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('workBatch redux actions', function() {
  beforeEach(function() {
    moxios.install();
  });

  afterEach(function() {
    moxios.uninstall();
  });

  const mockWorkBatch = {
    id: 4,
    name: 'Test3',
    organization: 1,
    handler: 'somehandler2',
    created: '2019-06-12T13:07:13.490Z',
    extra_fields: '',
    num_comments: 0,
    status: 0,
  };

  describe('get', () => {
    it('should create an action to request workBatches GET', () => {
      const expectedAction = {
        type: WORK_BATCHES_GET_REQUEST,
      };
      expect(workBatchesGetRequest()).toEqual(expectedAction);
    });

    it('should create an action to handle workBatches GET success', () => {
      const workBatches = [mockWorkBatch];
      const expectedAction = {
        type: WORK_BATCHES_GET_SUCCESS,
        workBatches,
      };
      expect(workBatchesGetSuccess(workBatches)).toEqual(expectedAction);
    });

    it('should create an action to handle workBatches GET failure', () => {
      const expectedAction = {
        type: WORK_BATCHES_GET_FAILURE,
        message: 'my error',
      };
      expect(workBatchesGetFailure('my error')).toEqual(expectedAction);
    });

    it('should create an action to GET workBatches from the workBatches API', async () => {
      const workBatches = [mockWorkBatch];
      const store = mockStore({workBatches: []});

      moxios.stubRequest('/api/0/organizations/sentry/work-batches/', {
        status: 200,
        responseText: workBatches,
      });

      const expectedActions = [
        {type: WORK_BATCHES_GET_REQUEST},
        {type: WORK_BATCHES_GET_SUCCESS, workBatches},
      ];

      return store.dispatch(workBatchesGet()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
        const request = moxios.requests.mostRecent();
        expect(request.url).toBe('/api/0/organizations/sentry/work-batches/');
      });
    });
  });

  describe('select', () => {
    it('should create an action to toggle the user selection of a workBatch', () => {
      const expectedAction = {
        type: WORK_BATCH_TOGGLE_SELECT,
        id: 100,
      };
      expect(workBatchToggleSelect(100)).toEqual(expectedAction);
    });

    it('should create an action to toggle the user selection of all workBatches', () => {
      const expectedAction = {
        type: WORK_BATCHES_TOGGLE_SELECT_ALL,
        doSelect: true,
      };
      expect(workBatchesToggleSelectAll(true)).toEqual(expectedAction);
    });
  });
});
