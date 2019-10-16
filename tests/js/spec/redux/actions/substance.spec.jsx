import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import moxios from 'moxios';

import {
  SUBSTANCES_GET_REQUEST,
  SUBSTANCES_GET_SUCCESS,
  SUBSTANCES_GET_FAILURE,
  SUBSTANCES_TOGGLE_SELECT_ALL,
  SUBSTANCE_TOGGLE_SELECT,
  substancesGetRequest,
  substancesGetSuccess,
  substancesGetFailure,
  substancesGet,
  substanceToggleSelect,
  substancesToggleSelectAll,
} from 'app/redux/actions/substance';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('substance redux actions', function() {
  beforeEach(function() {
    moxios.install();
  });

  afterEach(function() {
    moxios.uninstall();
  });

  const mockSubstance = {
    id: 2,
    version: 2,
    name: 'sample-625012-aliquot',
    properties: {
      comment: {
        id: '4',
        name: 'comment',
        display_name: 'comment',
        value: 'No this actually looks bad',
      },
      flammability: {
        id: '2',
        name: 'flammability',
        display_name: 'flammability',
        value: 0.9,
      },
      sample_type: 'amplicon',
      priority: 'Standard',
      weight: {
        id: '5',
        name: 'weight',
        display_name: 'weight',
        value: 0.5,
      },
      volume: 10,
    },
    type_full_name: 'clims.services.substance.SubstanceBase',
    position: {
      index: 'A:1',
      container: {
        name: 'cont1',
      },
    },
    days_waiting: 56,
  };

  describe('get', () => {
    it('should create an action to request substances GET', () => {
      const expectedAction = {
        type: SUBSTANCES_GET_REQUEST,
      };
      expect(substancesGetRequest()).toEqual(expectedAction);
    });

    it('should create an action to handle substances GET success', () => {
      const substances = [mockSubstance];
      const expectedAction = {
        type: SUBSTANCES_GET_SUCCESS,
        substances,
      };
      expect(substancesGetSuccess(substances)).toEqual(expectedAction);
    });

    it('should create an action to handle substances GET failure', () => {
      const expectedAction = {
        type: SUBSTANCES_GET_FAILURE,
        message: 'my error',
      };
      expect(substancesGetFailure('my error')).toEqual(expectedAction);
    });

    it('should create an action to GET substances from the substances API', async () => {
      const substances = [mockSubstance];
      const store = mockStore({substances: []});

      moxios.stubRequest('/api/0/organizations/lab/substances/', {
        status: 200,
        responseText: substances,
      });

      const expectedActions = [
        {type: SUBSTANCES_GET_REQUEST},
        {type: SUBSTANCES_GET_SUCCESS, substances},
      ];

      return store.dispatch(substancesGet()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
        const request = moxios.requests.mostRecent();
        expect(request.url).toBe('/api/0/organizations/lab/substances/');
      });
    });
  });

  describe('select', () => {
    it('should create an action to toggle the user selection of a substance', () => {
      const expectedAction = {
        type: SUBSTANCE_TOGGLE_SELECT,
        id: 100,
      };
      expect(substanceToggleSelect(100)).toEqual(expectedAction);
    });

    it('should create an action to toggle the user selection of all substances', () => {
      const expectedAction = {
        type: SUBSTANCES_TOGGLE_SELECT_ALL,
        doSelect: true,
      };
      expect(substancesToggleSelectAll(true)).toEqual(expectedAction);
    });
  });
});
