import {resource} from 'app/redux/reducers/sharedEntry';
import {makeResourceActions} from 'app/redux/actions/sharedEntry';

const RESOURCE_NAME = 'SOME_RESOURCE';

const initialStateEntry = {
  ...resource.initialState,
};

const reducerEntry = resource.createReducer(RESOURCE_NAME, initialStateEntry);
const actions = makeResourceActions(RESOURCE_NAME, '/api/0/some-resource/5/');

describe('shared resource reducer', () => {
  it('has expected state after requesting a single entry', () => {
    const requestedState = reducerEntry(initialStateEntry, actions.getRequest());
    expect(requestedState).toEqual({
      ...initialStateEntry,
      loadingDetails: true,
    });
  });

  it('has expected state when getting a successful single entry response', () => {
    const requestedState = reducerEntry(initialStateEntry, actions.getRequest());
    // We must get an item with an id back:
    const fetchedItem = {
      id: 1,
    };
    const successState = reducerEntry(requestedState, actions.getSuccess(fetchedItem));
    expect(successState).toEqual({
      ...initialStateEntry,
      resource: fetchedItem,
    });
  });

  it('has expected state when a single entry update has been requested', () => {
    const originalState = {
      ...initialStateEntry,
      errorMessage: 'oops',
      resource: {
        id: 5,
        name: 'orig-name',
      },
    };
    const entry = {
      id: 5,
      name: 'new-name',
    };
    const requestedState = reducerEntry(originalState, actions.updateRequest(entry));
    const expectedState = {
      ...originalState,
      updating: true,
      errorMessage: null,
    };
    expect(requestedState).toEqual(expectedState);
  });

  it('has expected state when a single entry update has succeeded', () => {
    const originalState = {
      ...initialStateEntry,
      updating: true,
      resource: {
        id: 5,
        name: 'orig-name',
      },
    };
    const entry = {
      id: 5,
      name: 'new-name',
    };
    const successState = reducerEntry(originalState, actions.updateSuccess(entry));
    const expectedState = {
      ...originalState,
      updating: false,
      resource: {
        id: 5,
        name: 'new-name',
      },
    };
    expect(successState).toEqual(expectedState);
  });

  it('has expected state when a single entry update has failed', () => {
    const originalState = {
      ...initialStateEntry,
      updating: true,
      resource: {
        id: 5,
        name: 'orig-name',
      },
    };
    const err = {
      statusCode: 1,
      message: 'oops',
    };
    const failedState = reducerEntry(
      originalState,
      actions.updateFailure(err.statusCode, err.message)
    );
    const expectedState = {
      ...originalState,
      updating: false,
      errorMessage: 'oops',
    };
    expect(failedState).toEqual(expectedState);
  });
});
