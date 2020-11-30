import {Set} from 'immutable';
import {resource} from 'app/redux/reducers/shared';
import {makeResourceActions} from 'app/redux/actions/shared';

const RESOURCE_NAME = 'SOME_RESOURCE';

// Tests the shared functionality of resource reducers
const initialState = {
  ...resource.initialState,
};

const reducer = resource.createReducer(RESOURCE_NAME, initialState);
const actions = makeResourceActions(
  RESOURCE_NAME,
  '/api/0/some-resource/',
  '/api/0/some-resource/5/'
);

function createGetListSuccessState() {
  const originalState = {...initialState};
  const requestedState = reducer(
    originalState,
    actions.getListRequest('search', 'groupby', 'cursor')
  );
  return reducer(
    requestedState,
    actions.getListSuccess(
      [
        {id: '1', name: 'entry1'},
        {id: '2', name: 'entry2'},
      ],
      'link-to-more-results'
    )
  );
}

describe('shared resource reducer', () => {
  it('has expected state after requesting a list', () => {
    const originalState = {...initialState};
    const requestedState = reducer(
      originalState,
      actions.getListRequest('search', 'groupby', 'cursor')
    );
    expect(requestedState).toEqual({
      loadingDetails: false,
      detailsId: null,
      loading: true,
      updating: false,
      errorMessage: null,
      byIds: {},
      listViewState: {
        allVisibleSelected: false,
        groupBy: 'groupby',
        search: 'search',
        visibleIds: [],
        selectedIds: new Set(),
        pagination: {pageLinks: null, cursor: 'cursor'},
      },
      creating: false,
    });
  });

  it('has expected state when getting a successful list response', () => {
    const successState = createGetListSuccessState();
    expect(successState).toEqual({
      loadingDetails: false,
      detailsId: null,
      loading: false,
      updating: false,
      errorMessage: null,
      byIds: {'1': {id: '1', name: 'entry1'}, '2': {id: '2', name: 'entry2'}},
      listViewState: {
        allVisibleSelected: false,
        groupBy: 'groupby',
        search: 'search',
        visibleIds: ['1', '2'],
        selectedIds: new Set(),
        pagination: {pageLinks: 'link-to-more-results', cursor: 'cursor'},
      },
      creating: false,
    });
  });

  it('has expected state when selecting/deselecting a page', () => {
    const successState = createGetListSuccessState();
    const selectedPageState = reducer(successState, actions.selectPage(true));
    const expectedSelectedPageState = {
      ...successState,
      listViewState: {
        ...successState.listViewState,
        allVisibleSelected: true,
        selectedIds: new Set(['1', '2']),
      },
    };
    expect(selectedPageState).toEqual(expectedSelectedPageState);
    const unSelectedPageState = reducer(selectedPageState, actions.selectPage(false));

    expect(unSelectedPageState).toEqual({
      ...expectedSelectedPageState,
      listViewState: {
        ...expectedSelectedPageState.listViewState,
        allVisibleSelected: false,
        selectedIds: new Set(),
      },
    });
  });

  it('has expected state when selecting/deselecting a single entry', () => {
    const successState = createGetListSuccessState();
    const selectedEntryState = reducer(successState, actions.select('1', true));
    const expectedSelectedEntryState = {
      ...successState,
      listViewState: {
        ...successState.listViewState,
        selectedIds: new Set(['1']),
      },
    };
    expect(selectedEntryState).toEqual(expectedSelectedEntryState);

    const unSelectedEntryState = reducer(selectedEntryState, actions.select('1', false));
    expect(unSelectedEntryState).toEqual({
      ...selectedEntryState,
      listViewState: {
        ...successState.listViewState,
        selectedIds: new Set(),
      },
    });
  });

  it('has expected state when requesting an entry to be created', () => {
    const successState = createGetListSuccessState();
    const createEntryRequestState = reducer(
      successState,
      actions.createRequest({id: '1'})
    );
    expect(createEntryRequestState).toEqual({
      ...successState,
      creating: true,
    });
  });

  it('has expected state when requesting an entry has successfully been created', () => {
    const newItem = {
      id: '3',
      name: 'entry3',
    };
    const successState = createGetListSuccessState();
    const createEntryRequestState = reducer(successState, actions.createRequest(newItem));
    const createEntrySuccessState = reducer(
      createEntryRequestState,
      actions.createSuccess(newItem)
    );

    expect(createEntrySuccessState).toEqual({
      ...successState,
      byIds: {
        ...successState.byIds,
        '3': newItem,
      },
    });
  });

  it('has expected state when a single entry update has been requested', () => {
    const originalState = {
      ...initialState,
      detailsId: 5,
      errorMessage: 'oops',
      byIds: {
        5: {
          id: 5,
          name: 'orig-name',
        },
      },
    };
    const entry = {
      id: 5,
      name: 'new-name',
    };
    const requestedState = reducer(originalState, actions.updateRequest(entry));
    const expectedState = {
      ...originalState,
      updating: true,
      errorMessage: null,
    };

    expect(requestedState).toEqual(expectedState);
  });

  it('has expected state when a single entry update has succeeded', () => {
    const originalState = {
      ...initialState,
      detailsId: 5,
      updating: true,
      byIds: {
        5: {
          id: 5,
          name: 'orig-name',
        },
      },
    };
    const entry = {
      id: 5,
      name: 'new-name',
    };
    const successState = reducer(originalState, actions.updateSuccess(entry));
    const expectedState = {
      ...originalState,
      updating: false,
      byIds: {
        5: {
          id: 5,
          name: 'new-name',
        },
      },
    };

    expect(successState).toEqual(expectedState);
  });

  it('has expected state when a single entry update has failed', () => {
    const originalState = {
      ...initialState,
      detailsId: 5,
      updating: true,
      byIds: {
        5: {
          id: 5,
          name: 'orig-name',
        },
      },
    };
    const err = {
      statusCode: 1,
      message: 'oops',
    };
    const failedState = reducer(
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

  it('has expected state after requesting a single entry', () => {
    const requestedState = reducer(initialState, actions.getRequest());
    expect(requestedState).toEqual({
      ...initialState,
      loadingDetails: true,
    });
  });

  it('has expected state when getting a successful single entry response', () => {
    const requestedState = reducer(initialState, actions.getRequest());
    // We must get an item with an id back:
    const fetchedItem = {
      id: 1,
    };
    const successState = reducer(requestedState, actions.getSuccess(fetchedItem));
    expect(successState).toEqual({
      ...initialState,
      detailsId: 1,
      byIds: {1: {id: 1}},
    });
  });

  it('has expected state when getting a failed response', () => {
    const originalState = {...initialState};
    const requestedState = reducer(
      originalState,
      actions.getListRequest('search', 'groupby', 'cursor')
    );
    const failedState = reducer(
      requestedState,
      actions.getListFailure(500, 'some error')
    );
    expect(failedState).toEqual({
      loadingDetails: false,
      detailsId: null,
      loading: false,
      updating: false,
      errorMessage: 'some error',
      byIds: {},
      listViewState: {
        allVisibleSelected: false,
        groupBy: 'groupby',
        search: 'search',
        visibleIds: [],
        selectedIds: new Set(),
        pagination: {pageLinks: null, cursor: 'cursor'},
      },
      creating: false,
    });
  });
});
