import {Set} from 'immutable';
import {resource} from 'app/redux/reducers/shared';
import {makeResourceActions} from 'app/redux/actions/shared';

const WORK_CONFIGURATION = 'WORK_CONFIGURATION';

const initialState = {
  ...resource.initialState,
};

const actions = makeResourceActions(WORK_CONFIGURATION, '/api/0/work-configurations/');
const reducer = resource.createReducer(WORK_CONFIGURATION, initialState);

describe('work configuration', () => {
  it('has expected state when getting a successful single entry response', () => {});
  const requestState = reducer(initialState, actions.getRequest());
  // We must get an item with an id back:
  const fetchedItem = {
    id: 1,
    buttons: [
      {
        name: 'button1',
        caption: 'button 1',
      },
    ],
  };
  const successState = reducer(requestState, actions.getSuccess(fetchedItem));
  expect(successState).toEqual({
    ...initialState,
    detailsId: 1,
    byIds: {1: fetchedItem},
  });
});
