import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import moxios from 'moxios';
import {entryActionCreators} from 'app/redux/actions/sharedEntry';

const RESOURCE_NAME = 'RESOURCE_NAME';

describe('shared action creators', () => {
  it('should create get request', () => {
    const action = entryActionCreators.acGetRequest(RESOURCE_NAME)('id');
    expect(action).toEqual({
      id: 'id',
      type: 'GET_RESOURCE_NAME_REQUEST',
    });
  });

  it('should create get success', () => {
    const fetchedEntry = {name: 'sample1'};
    const action = entryActionCreators.acGetSuccess(RESOURCE_NAME)(fetchedEntry);
    expect(action).toEqual({
      resource: fetchedEntry,
      type: 'GET_RESOURCE_NAME_SUCCESS',
    });
  });
  it('should create get failure', () => {
    const action = entryActionCreators.acGetFailure(RESOURCE_NAME)(500, 'My bad');
    expect(action).toEqual({
      message: 'My bad',
      statusCode: 500,
      type: 'GET_RESOURCE_NAME_FAILURE',
    });
  });
  it('should handle local changes', () => {
    const localChanges = {anAttribute: 'some value'};
    const action = entryActionCreators.acUpdateLocalRequest(RESOURCE_NAME)(localChanges);
    expect(action).toEqual({
      localChanges,
      type: 'UPDATE_RESOURCE_NAME_LOCAL_REQUEST',
    });
  });
});

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('shared async actions', () => {
  beforeEach(function () {
    moxios.install();
  });

  afterEach(function () {
    moxios.uninstall();
  });

  it('can get a single entry', () => {
    const store = mockStore({});
    const urlTemplate = '/api/0/organizations/{org}/resource-details/{id}';

    // NOTE: Using this instead of stubRequest as it's easier to debug
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: {some: 'object'},
        headers: {
          link: 'link',
        },
      });
    });

    const actionCreator = entryActionCreators.acGet(RESOURCE_NAME, urlTemplate);
    const org = {
      slug: 'lab',
    };
    const action = actionCreator(org, 2);
    const expectedActions = [
      {
        type: 'GET_RESOURCE_NAME_REQUEST',
        id: 2,
      },
      {
        type: 'GET_RESOURCE_NAME_SUCCESS',
        resource: {some: 'object'},
      },
    ];

    return store.dispatch(action).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      expect(moxios.requests.count()).toEqual(1);
      const request = moxios.requests.mostRecent();
      expect(request.url).toBe('/api/0/organizations/lab/resource-details/2/');
    });
  });

  it.skip('can handle PUT event', () => {
    const store = mockStore({});
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
      });
    });

    const newState = {
      id: 5,
      someEntry: 'new value',
    };
    const expectedActions = [
      {
        type: 'UPDATE_RESOURCE_NAME_REQUEST',
        resource: newState,
      },
      {
        type: 'UPDATE_RESOURCE_NAME_SUCCESS',
        resource: newState,
      },
    ];
    const org = {
      slug: 'lab',
    };
    const urlTemplate = '/api/0/organizations/{org}/resource-name/{id}';
    const acUpdateRoutine = entryActionCreators.acUpdate(RESOURCE_NAME, urlTemplate);
    const action = acUpdateRoutine(org, newState);

    return store.dispatch(action).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      expect(moxios.requests.count()).toEqual(1);
      const request = moxios.requests.mostRecent();
      expect(request.url).toBe('/api/0/organizations/lab/resource-name/5/');
    });
  });
});
