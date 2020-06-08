import workBatch, {initialState} from 'app/redux/reducers/workBatch';
import {Set} from 'immutable';

describe('workBatch reducer', () => {
  it('should handle initial state', () => {
    expect(workBatch(undefined, {})).toEqual(initialState);
  });

  it('should handle WORK_BATCHES_GET_REQUEST', () => {
    const state = workBatch(initialState, {
      type: 'WORK_BATCHES_GET_REQUEST',
      groupBy: '1',
      cursor: '2',
      search: '3',
    });

    expect(state).toEqual({
      byIds: {},
      creating: false,
      errorMessage: null,
      listViewState: {
        allVisibleSelected: false,
        groupBy: '1',
        pagination: {
          cursor: '2',
          pageLinks: null,
        },
        search: '3',
        selectedIds: new Set(),
        visibleIds: [],
      },
      loading: true,
    });
  });

  it('should handle WORK_BATCHES_GET_SUCCESS', () => {
    const state = workBatch(initialState, {
      type: 'WORK_BATCHES_GET_SUCCESS',
      workBatches: [TestStubs.WorkBatch(1)],
    });

    expect(state).toEqual({
      byIds: {
        '1': {
          created: '2019-06-12T13:07:13.490Z',
          extra_fields: '',
          handler: 'somehandler2',
          id: 1,
          name: 'Test1',
          num_comments: 0,
          organization: 1,
          status: 0,
        },
      },
      creating: false,
      errorMessage: null,
      listViewState: {
        allVisibleSelected: false,
        groupBy: 'workbatch',
        pagination: {pageLinks: undefined},
        search: 'workbatch.name:',
        selectedIds: new Set(),
        visibleIds: [1],
      },
      loading: false,
    });
  });

  it('should handle WORK_BATCHES_GET_FAILURE', () => {
    const state = workBatch(initialState, {
      type: 'WORK_BATCHES_GET_FAILURE',
      message: 'oopsiedoodle',
    });

    expect(state).toEqual({
      byIds: {},
      creating: false,
      errorMessage: 'oopsiedoodle',
      listViewState: {
        allVisibleSelected: false,
        groupBy: 'workbatch',
        pagination: {cursor: '', pageLinks: null},
        search: 'workbatch.name:',
        selectedIds: new Set(),
        visibleIds: [],
      },
      loading: false,
    });
  });

  it('should handle WORK_BATCH_TOGGLE_SELECT to select a workBatch', () => {
    const state = workBatch(initialState, {
      type: 'WORK_BATCH_TOGGLE_SELECT',
      id: 4,
    });

    expect(state).toEqual({
      byIds: {},
      creating: false,
      errorMessage: null,
      listViewState: {
        allVisibleSelected: false,
        groupBy: 'workbatch',
        pagination: {cursor: '', pageLinks: null},
        search: 'workbatch.name:',
        selectedIds: Set([4]),
        visibleIds: [],
      },
      loading: false,
    });
  });

  it('should handle WORK_BATCH_TOGGLE_SELECT to de-select a workBatch', () => {
    // First select the item
    const singleSelectedState = workBatch(initialState, {
      type: 'WORK_BATCH_TOGGLE_SELECT',
      id: 4,
    });

    const deselectedState = workBatch(singleSelectedState, {
      type: 'WORK_BATCH_TOGGLE_SELECT',
      id: 4,
    });
    expect(deselectedState).toEqual(initialState);
  });

  it('should handle WORK_BATCHES_TOGGLE_SELECT_ALL to select a visible page', () => {
    const afterGetState = workBatch(initialState, {
      type: 'WORK_BATCHES_GET_SUCCESS',
      workBatches: [TestStubs.WorkBatch(1), TestStubs.WorkBatch(2)],
    });
    const pageSelectedState = workBatch(afterGetState, {
      type: 'WORK_BATCHES_TOGGLE_SELECT_ALL',
    });
    expect(pageSelectedState.listViewState.selectedIds).toEqual(Set([1, 2]));
  });

  it('should handle WORK_BATCHES_TOGGLE_SELECT_ALL to deselect a visible page', () => {
    const afterGetState = workBatch(initialState, {
      type: 'WORK_BATCHES_GET_SUCCESS',
      workBatches: [TestStubs.WorkBatch(1), TestStubs.WorkBatch(2)],
    });
    const pageSelectedState = workBatch(afterGetState, {
      type: 'WORK_BATCHES_TOGGLE_SELECT_ALL',
    });
    const pageDeselectedState = workBatch(pageSelectedState, {
      type: 'WORK_BATCHES_TOGGLE_SELECT_ALL',
    });
    expect(pageDeselectedState.listViewState.selectedIds).toEqual(Set([]));
  });
});
