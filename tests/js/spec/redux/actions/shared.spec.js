import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import moxios from 'moxios';
import {listActionCreators} from 'app/redux/actions/sharedList';

const RESOURCE_NAME = 'RESOURCE_NAME';

describe('shared action creators', () => {
  it('should create getListRequest', () => {
    const action = listActionCreators.acGetListRequest(RESOURCE_NAME)(
      'search',
      'groupby',
      'cursor'
    );
    expect(action).toEqual({
      type: 'GET_RESOURCE_NAME_LIST_REQUEST',
      search: 'search',
      groupBy: 'groupby',
      cursor: 'cursor',
    });
  });

  it('should create getListSuccess', () => {
    const action = listActionCreators.acGetListSuccess(RESOURCE_NAME)(
      ['entry1', 'entry2'],
      'link'
    );
    expect(action).toEqual({
      type: 'GET_RESOURCE_NAME_LIST_SUCCESS',
      entries: ['entry1', 'entry2'],
      link: 'link',
    });
  });

  it('should create getListFailure', () => {
    const action = listActionCreators.acGetListFailure(RESOURCE_NAME)(500, 'some error');
    expect(action).toEqual({
      type: 'GET_RESOURCE_NAME_LIST_FAILURE',
      statusCode: 500,
      message: 'some error',
    });
  });

  it('should create selectPage', () => {
    const action = listActionCreators.acSelectPage(RESOURCE_NAME)(true);
    expect(action).toEqual({
      type: 'SELECT_PAGE_OF_RESOURCE_NAME',
      doSelect: true,
    });
  });

  it('should create select', () => {
    const action = listActionCreators.acSelect(RESOURCE_NAME)('id', true);
    expect(action).toEqual({
      type: 'SELECT_RESOURCE_NAME',
      doSelect: true,
      id: 'id',
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

  it('can get a list', () => {
    const store = mockStore({});
    const url = '/url?search=search&cursor=cursor';

    // NOTE: Using this instead of stubRequest as it's easier to debug
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: ['anything1', 'anything2'],
        headers: {
          link: 'link',
        },
      });
    });

    const actionCreator = listActionCreators.acGetList(RESOURCE_NAME, url);
    const action = actionCreator('org', 'search', 'groupBy', 'cursor');
    const expectedActions = [
      {
        type: 'GET_RESOURCE_NAME_LIST_REQUEST',
        search: 'search',
        groupBy: 'groupBy',
        cursor: 'cursor',
      },
      {
        type: 'GET_RESOURCE_NAME_LIST_SUCCESS',
        entries: ['anything1', 'anything2'],
        link: 'link',
      },
    ];

    return store.dispatch(action).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      expect(moxios.requests.count()).toEqual(1);
    });
  }, 500);

  it('can handle GET failure', () => {
    const store = mockStore({});

    // NOTE: Using this instead of stubRequest as it's easier to debug
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      const errResp = {
        status: 400,
        request: {
          status: 400,
          statusText: 'a bad request',
          responseText: 'response text',
        },
        headers: [],
      };
      request.reject(errResp);
    });

    const actionCreator = listActionCreators.acGetList(RESOURCE_NAME, '/url');
    const action = actionCreator('org', 'search', 'groupBy', 'cursor');
    const expectedActions = [
      {
        type: 'GET_RESOURCE_NAME_LIST_REQUEST',
        search: 'search',
        groupBy: 'groupBy',
        cursor: 'cursor',
      },
      {
        type: 'GET_RESOURCE_NAME_LIST_FAILURE',
        statusCode: 400,
        message: '(a bad request) response text',
      },
    ];

    return store.dispatch(action).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      expect(moxios.requests.count()).toEqual(1);
    });
  }, 500);

  it.skip('can send POST event', () => {
    const store = mockStore({});
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
      });
    });

    const newState = {
      someEntry: 'new value',
    };
    const expectedActions = [
      {
        type: 'CREATE_RESOURCE_NAME_REQUEST',
        entry: newState,
      },
      {
        type: 'CREATE_RESOURCE_NAME_SUCCESS',
        entry: newState,
      },
    ];
    const org = {
      slug: 'lab',
    };
    const urlTemplate = '/api/0/organizations/{org}/resource-name/';
    const actionCreator = listActionCreators.acCreate(RESOURCE_NAME, urlTemplate);
    const action = actionCreator(org, newState);

    return store.dispatch(action).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      expect(moxios.requests.count()).toEqual(1);
      const request = moxios.requests.mostRecent();
      expect(request.url).toBe('/api/0/organizations/lab/resource-name/');
    });
  });
  it.skip('can handle POST failure', () => {
    const store = mockStore({});
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 400,
      });
    });

    const newState = {
      someEntry: 'new value',
    };
    const expectedActions = [
      {
        type: 'CREATE_RESOURCE_NAME_REQUEST',
        entry: newState,
      },
      {
        type: 'CREATE_RESOURCE_NAME_FAILURE',
      },
    ];
    const org = {
      slug: 'lab',
    };
    const urlTemplate = '/api/0/organizations/{org}/resource-name/';
    const actionCreator = listActionCreators.acCreate(RESOURCE_NAME, urlTemplate);
    const action = actionCreator(org, newState);

    return store.dispatch(action).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      expect(moxios.requests.count()).toEqual(1);
      const request = moxios.requests.mostRecent();
      expect(request.url).toBe('/api/0/organizations/lab/resource-name/');
    });
  });
});
