import workBatch, {initialState} from 'app/redux/reducers/workBatch';
import {workBatchActions} from 'app/redux/actions/workBatch';
import {Set} from 'immutable';

describe('workBatch reducer', () => {
  it('should handle getRequest', () => {
    const state = workBatch(
      initialState,
      workBatchActions.getListRequest('search', 'groupby', 'cursor')
    );
    const expected = {
      loadingDetails: false,
      detailsId: null,
      loading: true,
      errorMessage: null,
      byIds: {},
      listViewState: {
        allVisibleSelected: false,
        groupBy: 'groupby',
        search: 'search',
        visibleIds: [],
        selectedIds: Set(),
        pagination: {pageLinks: null, cursor: 'cursor'},
      },
      creating: false,
    };
    expect(state).toEqual(expected);
  });

  it('should handle getListSuccess', () => {
    const entries = [TestStubs.WorkBatch(1), TestStubs.WorkBatch(2)];
    const state = workBatch(
      initialState,
      workBatchActions.getListSuccess(entries, 'link')
    );
    const expected = {
      loadingDetails: false,
      detailsId: null,
      loading: false,
      errorMessage: null,
      byIds: {
        1: entries[0],
        2: entries[1],
      },
      listViewState: {
        allVisibleSelected: false,
        groupBy: null,
        search: null,
        visibleIds: [1, 2],
        selectedIds: Set(),
        pagination: {pageLinks: 'link'},
      },
      creating: false,
    };
    expect(state).toEqual(expected);
  });

  it('should handle getListFailure', () => {
    const state = workBatch(initialState, workBatchActions.getListFailure('message'));
    const expected = {
      loadingDetails: false,
      detailsId: null,
      loading: false,
      errorMessage: 'message',
      byIds: {},
      listViewState: {
        allVisibleSelected: false,
        groupBy: null,
        search: null,
        visibleIds: [],
        selectedIds: Set(),
        pagination: {pageLinks: null, cursor: null},
      },
      creating: false,
    };
    expect(state).toEqual(expected);
  });

  it('should handle select/deselect for a page', () => {
    const entries = [TestStubs.WorkBatch(1), TestStubs.WorkBatch(2)];
    const stateAfterSuccess = workBatch(
      initialState,
      workBatchActions.getListSuccess(entries, 'link')
    );
    const afterSelectPage = workBatch(
      stateAfterSuccess,
      workBatchActions.selectPage(true)
    );
    const expectedAfterSelectPage = {
      loadingDetails: false,
      detailsId: null,
      loading: false,
      errorMessage: null,
      byIds: {
        1: entries[0],
        2: entries[1],
      },
      listViewState: {
        allVisibleSelected: true,
        groupBy: null,
        search: null,
        visibleIds: [1, 2],
        selectedIds: Set([1, 2]),
        pagination: {pageLinks: 'link'},
      },
      creating: false,
    };
    expect(afterSelectPage).toEqual(expectedAfterSelectPage);

    const afterDeselectPage = workBatch(
      afterSelectPage,
      workBatchActions.selectPage(false)
    );
    const expectedAfterDeselectPage = {
      ...expectedAfterSelectPage,
      listViewState: {
        ...expectedAfterSelectPage.listViewState,
        allVisibleSelected: false,
        selectedIds: Set(),
      },
    };
    expect(afterDeselectPage).toEqual(expectedAfterDeselectPage);
  });

  it('should handle select/deselect for a single entry', () => {
    const entries = [TestStubs.WorkBatch(1), TestStubs.WorkBatch(2)];
    const stateAfterSuccess = workBatch(
      initialState,
      workBatchActions.getListSuccess(entries, 'link')
    );
    const stateAfterSelectFirst = workBatch(
      stateAfterSuccess,
      workBatchActions.select(1, true)
    );
    const expectedStateAfterSelectFirst = {
      loadingDetails: false,
      detailsId: null,
      loading: false,
      errorMessage: null,
      byIds: {
        1: entries[0],
        2: entries[1],
      },
      listViewState: {
        allVisibleSelected: false,
        groupBy: null,
        search: null,
        visibleIds: [1, 2],
        selectedIds: Set([1]),
        pagination: {pageLinks: 'link'},
      },
      creating: false,
    };
    expect(stateAfterSelectFirst).toEqual(expectedStateAfterSelectFirst);

    const stateAfterDeselectFirst = workBatch(
      stateAfterSuccess,
      workBatchActions.select(1, false)
    );
    const expectedStateAfterDeselectFirst = {
      ...expectedStateAfterSelectFirst,
      listViewState: {
        ...expectedStateAfterSelectFirst.listViewState,
        selectedIds: Set(),
      },
    };
    expect(stateAfterDeselectFirst).toEqual(expectedStateAfterDeselectFirst);
  });

  it('should handle requesting creation of an entry', () => {
    const state = workBatch(
      initialState,
      workBatchActions.createRequest('search', 'groupby', 'cursor')
    );
    console.log(state);


  });
});
