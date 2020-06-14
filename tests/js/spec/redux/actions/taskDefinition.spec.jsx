import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import moxios from 'moxios';

import {
  GET_TASK_DEFINITION_LIST_REQUEST,
  GET_TASK_DEFINITION_LIST_SUCCESS,
  GET_TASK_DEFINITION_LIST_FAILURE,
  getTaskDefinitionList,
  getTaskDefinitionListSuccess,
  getTaskDefinitionListFailure,
  getTaskDefinitionListRequest,
} from 'app/redux/actions/taskDefinition';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('task definition redux actions', function() {
  beforeEach(function() {
    moxios.install();
  });

  afterEach(function() {
    moxios.uninstall();
  });

  describe('get', () => {
    it('should create an action that indicates a request for a list of TaskDefinition', () => {
      const expectedAction = {
        type: GET_TASK_DEFINITION_LIST_REQUEST,
      };
      expect(getTaskDefinitionListRequest()).toEqual(expectedAction);
    });

    it('should create an action that indicates successful retrieval of a list of TaskDefinition', () => {
      const expectedAction = {
        type: GET_TASK_DEFINITION_LIST_SUCCESS,
      };
      expect(getTaskDefinitionListSuccess()).toEqual(expectedAction);
    });

    it('should create an action that indicates failure while getting a list of TaskDefinition', () => {
      const expectedAction = {
        type: GET_TASK_DEFINITION_LIST_FAILURE,
        message: 'my error',
      };
      expect(getTaskDefinitionListFailure('my error')).toEqual(expectedAction);
    });

    it('should create an action to get a list of TaskDefinition', async () => {
      const org = TestStubs.Organization();
      const entries = [TestStubs.TaskDefinition(1)];
      const store = mockStore();

      moxios.stubRequest('/api/0/organizations/org-slug/task-definitions/', {
        status: 200,
        responseText: entries,
      });

      const expectedActions = [
        {type: GET_TASK_DEFINITION_LIST_REQUEST},
        {type: GET_TASK_DEFINITION_LIST_SUCCESS, entries},
      ];

      return store.dispatch(getTaskDefinitionList(org)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
        const request = moxios.requests.mostRecent();
        expect(request.url).toBe('/api/0/organizations/org-slug/task-definitions/');
      });
    });
  });
});
