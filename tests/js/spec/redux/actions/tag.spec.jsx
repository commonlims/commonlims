import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import moxios from 'moxios';

import {
  TAGS_GET_REQUEST,
  TAGS_GET_SUCCESS,
  TAGS_GET_FAILURE,
  tagsGetRequest,
  tagsGetSuccess,
  tagsGetFailure,
  tagsGet,
} from 'app/redux/actions/tag';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('tag redux actions', function() {
  beforeEach(function() {
    moxios.install();
  });

  afterEach(function() {
    moxios.uninstall();
  });

  const tags = {
    tagExample: {
      key: 'tag-example',
      name: 'Tag example',
      values: [],
      predefined: false,
    },
  };

  describe('get', () => {
    it('should create an action to request tags GET', () => {
      const expectedAction = {
        type: TAGS_GET_REQUEST,
      };
      expect(tagsGetRequest()).toEqual(expectedAction);
    });

    it('should create an action to handle tags GET success', () => {
      const expectedAction = {
        type: TAGS_GET_SUCCESS,
        tags,
      };
      expect(tagsGetSuccess(tags)).toEqual(expectedAction);
    });

    it('should create an action to handle tags GET failure', () => {
      const expectedAction = {
        type: TAGS_GET_FAILURE,
        message: 'my error',
      };
      expect(tagsGetFailure('my error')).toEqual(expectedAction);
    });

    // TODO: Re-enable pending CLIMS-202
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should create an action to GET tags from the tags API', async () => {
      const store = mockStore({tags: {}});

      moxios.stubRequest('/api/0/organizations/sentry/tags/someResource', {
        status: 200,
        responseText: tags,
      });

      const expectedActions = [{type: TAGS_GET_REQUEST}, {type: TAGS_GET_SUCCESS, tags}];

      return store.dispatch(tagsGet('someResource')).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
        const request = moxios.requests.mostRecent();
        expect(request.url).toBe('/api/0/organizations/sentry/tags/someResource');
      });
    });
  });
});
