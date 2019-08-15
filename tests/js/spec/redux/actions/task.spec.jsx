import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import moxios from 'moxios';

import {
  TASKS_GET_REQUEST,
  TASKS_GET_SUCCESS,
  TASKS_GET_FAILURE,
  tasksGetRequest,
  tasksGetSuccess,
  tasksGetFailure,
  tasksGet,
} from 'app/redux/actions/task';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('task redux actions', function() {
  beforeEach(function() {
    moxios.install();
  });

  afterEach(function() {
    moxios.uninstall();
  });

  const mockTask = {
    id: 1,
    name: 'Fragment Analyze',
    organization: 1,
    num_samples: 175,
  };

  describe('get', () => {
    it('should create an action to request tasks GET', () => {
      const expectedAction = {
        type: TASKS_GET_REQUEST,
      };
      expect(tasksGetRequest()).toEqual(expectedAction);
    });

    it('should create an action to handle tasks GET success', () => {
      const tasks = [mockTask];
      const expectedAction = {
        type: TASKS_GET_SUCCESS,
        tasks,
      };
      expect(tasksGetSuccess(tasks)).toEqual(expectedAction);
    });

    it('should create an action to handle tasks GET failure', () => {
      const expectedAction = {
        type: TASKS_GET_FAILURE,
        message: 'my error',
      };
      expect(tasksGetFailure('my error')).toEqual(expectedAction);
    });

    it('should create an action to GET tasks from the tasks API', async () => {
      const tasks = [mockTask];
      const store = mockStore({tasks: []});

      moxios.stubRequest('/api/0/organizations/sentry/tasks/', {
        status: 200,
        responseText: tasks,
      });

      const expectedActions = [
        {type: TASKS_GET_REQUEST},
        {type: TASKS_GET_SUCCESS, tasks},
      ];

      return store.dispatch(tasksGet()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
        const request = moxios.requests.mostRecent();
        expect(request.url).toBe('/api/0/organizations/sentry/tasks/');
      });
    });
  });
});
