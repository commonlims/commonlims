import {Set} from 'immutable';
import {resource} from 'app/redux/reducers/sharedList';
import {makeResourceActions} from 'app/redux/actions/shared';

const RESOURCE_NAME = 'SOME_RESOURCE';

// Tests the shared functionality of resource reducers
const initialStateEntry = {
  ...resource.initialState,
};

const initialStateList = {
  ...resource.initialState,
};

const reducerList = resource.createReducer(RESOURCE_NAME, initialStateList);
const reducerEntry = resource.createReducer(RESOURCE_NAME, initialStateEntry);
const actions = makeResourceActions(
  RESOURCE_NAME,
  '/api/0/some-resource/',
  '/api/0/some-resource/5/'
);

function createGetListSuccessState() {
  const originalState = {...initialStateList};
  const requestedState = reducerList(
    originalState,
    actions.getListRequest('search', 'groupby', 'cursor')
  );
  return reducerList(
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
    const originalState = {...initialStateList};
    const requestedState = reducerList(
      originalState,
      actions.getListRequest('search', 'groupby', 'cursor')
    );
    expect(requestedState).toEqual({
      loading: true,
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
      loading: false,
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
    const selectedPageState = reducerList(successState, actions.selectPage(true));
    const expectedSelectedPageState = {
      ...successState,
      listViewState: {
        ...successState.listViewState,
        allVisibleSelected: true,
        selectedIds: new Set(['1', '2']),
      },
    };
    expect(selectedPageState).toEqual(expectedSelectedPageState);
    const unSelectedPageState = reducerList(selectedPageState, actions.selectPage(false));

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
    const selectedEntryState = reducerList(successState, actions.select('1', true));
    const expectedSelectedEntryState = {
      ...successState,
      listViewState: {
        ...successState.listViewState,
        selectedIds: new Set(['1']),
      },
    };
    expect(selectedEntryState).toEqual(expectedSelectedEntryState);

    const unSelectedEntryState = reducerList(
      selectedEntryState,
      actions.select('1', false)
    );
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
    const createEntryRequestState = reducerList(
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
    const createEntryRequestState = reducerList(
      successState,
      actions.createRequest(newItem)
    );
    const createEntrySuccessState = reducerList(
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

  it('has expected state when getting a failed response', () => {
    const originalState = {...initialStateList};
    const requestedState = reducerList(
      originalState,
      actions.getListRequest('search', 'groupby', 'cursor')
    );
    const failedState = reducerList(
      requestedState,
      actions.getListFailure(500, 'some error')
    );
    expect(failedState).toEqual({
      loading: false,
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
