import substanceSearchEntry, {
  initialState,
} from 'app/redux/reducers/substanceSearchEntry';
import {Set} from 'immutable';
import {keyBy} from 'lodash';

describe('substance reducer', () => {
  const mockResponseNoGroup = TestStubs.SubstanceSearchEntries(2, 'sample');
  const mockResponseNoGroupById = keyBy(mockResponseNoGroup, entry => entry.id);

  it('should handle initial state', () => {
    expect(substanceSearchEntry(undefined, {})).toEqual(initialState);
  });

  it('should handle SUBSTANCE_SEARCH_ENTRIES_GET_REQUEST', () => {
    const prevState = {
      ...initialState,
      loading: false,
      errorMessage: 'oops',
    };

    const nextState = substanceSearchEntry(prevState, {
      type: 'SUBSTANCE_SEARCH_ENTRIES_GET_REQUEST',
      groupBy: 'aGroup',
      search: 'aSearch',
      cursor: 'aCursor',
    });

    expect(nextState).toEqual({
      ...prevState,
      loading: true,
      errorMessage: null,
      groupBy: 'aGroup',
      search: 'aSearch',
      cursor: 'aCursor',
    });
  });

  it('should handle SUBSTANCE_SEARCH_ENTRIES_GET_SUCCESS for not-grouped', () => {
    // Arrange
    const prevState = {
      ...initialState,
      loading: true,
      errorMessage: 'oops',
    };

    const action = {
      type: 'SUBSTANCE_SEARCH_ENTRIES_GET_SUCCESS',
      substanceSearchEntries: JSON.parse(JSON.stringify(mockResponseNoGroup)),
      isGroupHeader: false,
      link: 'some-link',
    };

    // Act
    const nextState = substanceSearchEntry(prevState, action);

    // Assert

    const responseFromReducer = TestStubs.SubstanceEntriesFromReducer(2, 'sample');
    const mockedByIds = keyBy(responseFromReducer, entry => entry.id);
    expect(nextState).toEqual({
      ...prevState,
      errorMessage: null,
      loading: false,
      visibleIds: [1, 2],
      byIds: mockedByIds,
      pageLinks: 'some-link',
    });
  });

  it('should handle SUBSTANCE_SEARCH_ENTRIES_GET_SUCCESS for grouped', () => {
    // Arrange
    const mockResponseGrouped = ['my_sample_type'];

    const action = {
      type: 'SUBSTANCE_SEARCH_ENTRIES_GET_SUCCESS',
      substanceSearchEntries: JSON.parse(JSON.stringify(mockResponseGrouped)),
      link: 'some-link',
      isGroupHeader: true,
    };

    const prevState = {
      ...initialState,
      loading: true,
      errorMessage: 'oops',
    };

    // Act
    const nextState = substanceSearchEntry(prevState, action);

    // Assert
    const mockedResponseFromReducer = [
      {
        id: 1,
        name: 'my_sample_type',
        isGroupHeader: true,
      },
    ];

    const mockedByIds = keyBy(mockedResponseFromReducer, entry => entry.id);

    expect(nextState).toEqual({
      ...prevState,
      errorMessage: null,
      loading: false,
      visibleIds: [1],
      byIds: mockedByIds,
      pageLinks: 'some-link',
    });
  });

  it('should handle SUBSTANCE_SEARCH_ENTRIES_GET_FAILURE', () => {
    const prevState = {
      ...initialState,
      loading: true,
    };

    const nextState = substanceSearchEntry(prevState, {
      type: 'SUBSTANCE_SEARCH_ENTRIES_GET_FAILURE',
      message: 'oopsiedoodle',
    });

    expect(nextState).toEqual({
      ...initialState,
      loading: false,
      errorMessage: 'oopsiedoodle',
    });
  });

  it('should handle toggling a single search entry', () => {
    const prevState = {
      ...initialState,
      byIds: mockResponseNoGroupById,
    };

    const nextState = substanceSearchEntry(prevState, {
      type: 'SUBSTANCE_SEARCH_ENTRY_TOGGLE_SELECT',
      id: 1,
      doSelect: null, // null means toggle from previous state
    });

    expect(nextState).toEqual({
      ...prevState,
      byIds: mockResponseNoGroupById,
      selectedIds: prevState.selectedIds.add(1),
    });
  });

  it('should handle de-selecting a substance', () => {
    const prevState = {
      ...initialState,
      selectedIds: initialState.selectedIds.add(1),
    };

    const nextState = substanceSearchEntry(prevState, {
      type: 'SUBSTANCE_SEARCH_ENTRY_TOGGLE_SELECT',
      id: 1,
      doSelect: null,
    });

    expect(nextState).toEqual(initialState);
  });

  it('gets expected page state through mock', () => {
    // This test makes sure that our test stub returns the expected state, so we don't have
    // to in the tests that use it. Note that this duplicates the test for
    // SUBSTANCE_SEARCH_ENTRIES_GET_SUCCESS as the stub uses that action under the hood
    const prevState = TestStubs.SubstanceSearchEntriesPageState(2, 'sample');
    expect(prevState.visibleIds).toEqual([1, 2]);
    expect(prevState.selectedIds).toEqual(new Set());
  });

  it('should handle selecting and deselecting all search entries', () => {
    const state1 = TestStubs.SubstanceSearchEntriesPageState(2, 'sample');
    expect(state1.selectedIds.isEmpty()).toBe(true);

    const state2 = substanceSearchEntry(state1, {
      type: 'SUBSTANCE_SEARCH_ENTRIES_TOGGLE_SELECT_ALL',
      doSelect: true,
    });
    expect(state2.selectedIds.isEmpty()).toBe(false);
    expect(state2.selectedIds).toEqual(new Set([1, 2]));

    const state3 = substanceSearchEntry(state2, {
      type: 'SUBSTANCE_SEARCH_ENTRIES_TOGGLE_SELECT_ALL',
      doSelect: false,
    });
    expect(state3.selectedIds.isEmpty()).toBe(true);
  });
});
