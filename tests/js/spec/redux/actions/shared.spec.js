import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import moxios from 'moxios';
import {resourceActionCreators} from 'app/redux/actions/shared';

const RESOURCE_NAME = 'RESOURCE_NAME';

describe('shared action creators', () => {
  it('should create getListRequest', () => {
    const action = resourceActionCreators.acGetListRequest(RESOURCE_NAME)(
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
    const action = resourceActionCreators.acGetListSuccess(RESOURCE_NAME)(
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
    const action = resourceActionCreators.acGetListFailure(RESOURCE_NAME)(500, 'some error');
    expect(action).toEqual({
      type: 'GET_RESOURCE_NAME_LIST_FAILURE',
      statusCode: 500,
      message: 'some error',
    });
  });

  it('should create selectPage', () => {
    const action = resourceActionCreators.acSelectPage(RESOURCE_NAME)(true);
    expect(action).toEqual({
      type: 'SELECT_PAGE_OF_RESOURCE_NAME',
      doSelect: true,
    });
  });

  it('should create select', () => {
    const action = resourceActionCreators.acSelect(RESOURCE_NAME)('id', true);
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

  it('handles 200', () => {
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

    const actionCreator = resourceActionCreators.acGetList(RESOURCE_NAME, url);
    const action = actionCreator('search', 'groupBy', 'cursor');
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
});
