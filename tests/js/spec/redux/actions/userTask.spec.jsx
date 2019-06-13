import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
  USER_TASKS_GET_REQUEST,
  USER_TASKS_GET_SUCCESS,
  USER_TASKS_GET_FAILURE,
  userTasksGetRequest,
  userTasksGetSuccess,
  userTasksGetFailure,
  userTasksGet,
} from 'app/redux/actions/userTask';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('userTask redux actions', function() {
  const mockUserTask = {
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
    it('should create an action to request userTasks GET', () => {
      const expectedAction = {
        type: USER_TASKS_GET_REQUEST,
      };
      expect(userTasksGetRequest()).toEqual(expectedAction);
    });

    it('should create an action to handle userTasks GET success', () => {
      const userTasks = [mockUserTask];
      const expectedAction = {
        type: USER_TASKS_GET_SUCCESS,
        userTasks,
      };
      expect(userTasksGetSuccess(userTasks)).toEqual(expectedAction);
    });

    it('should create an action to handle userTasks GET failure', () => {
      const expectedAction = {
        type: USER_TASKS_GET_FAILURE,
        message: 'my error',
      };
      expect(userTasksGetFailure('my error')).toEqual(expectedAction);
    });

    it('should create an action to GET userTasks from the userTasks API', () => {
      const userTasks = [mockUserTask];
      fetch.mockResponseOnce(JSON.stringify({userTasks}));
      const store = mockStore({userTasks: []});

      const expectedActions = [
        {type: USER_TASKS_GET_REQUEST},
        {type: USER_TASKS_GET_SUCCESS, userTasks},
      ];

      return store.dispatch(userTasksGet()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);

        expect(fetch.mock.calls.length).toEqual(1);
        const url = fetch.mock.calls[0][0];
        expect(url).toEqual('/api/0/organizations/sentry/user-tasks/');
      });
    });
  });
});
