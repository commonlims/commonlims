import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import moxios from 'moxios';
import {resourceActionCreators} from 'app/redux/actions/shared';

const EVENT = 'EVENT';

describe('button event redux action', () => {
  beforeEach(function () {
    moxios.install();
  });

  afterEach(function () {
    moxios.uninstall();
  });

  const middlewares = [thunk];
  const mockStore = configureStore(middlewares);

  describe('create event', () => {
    it.skip('should create an action to send post event', () => {
      const store = mockStore({});
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();
        request.respondWith({
          status: 200,
          headers: [],
        });
      });

      const buttonClickedEvent = {
        event: 'mybutton_clicked',
        workbatchId: 4,
      };
      const expectedActions = [
        {
          type: 'CREATE_EVENT_REQUEST',
          entry: buttonClickedEvent,
        },
        {
          type: 'CREATE_EVENT_SUCCESS',
          entry: buttonClickedEvent,
        },
      ];
      const org = {
        slug: 'lab',
      };
      const urlTemplate = '/api/0/organizations/{org}/events/';
      const startButtonClickedEvent = resourceActionCreators.acCreate(EVENT, urlTemplate);
      const action = startButtonClickedEvent(org, buttonClickedEvent);

      return store.dispatch(action).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
        expect(moxios.requests.count()).toEqual(1);
        const request = moxios.requests.mostRecent();
        expect(request.url).toBe('/api/0/organizations/lab/events/');
      });
    });
  });
});
