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
      detailsId: null,
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
      loadingDetails: false,
    });
  });

  it('should handle WORK_BATCHES_GET_SUCCESS', () => {
    const state = workBatch(initialState, {
      type: 'WORK_BATCHES_GET_SUCCESS',
      entries: [TestStubs.WorkBatch(1)],
    });

    expect(state).toEqual({
      byIds: {
        '1': {
          created_at: '2020-03-18T21:55:21.255768Z',
          updated_at: '2020-03-18T21:55:21.255788Z',
          extra_fields: '',
          handler: '',
          id: 1,
          name: 'WorkBatch1',
          num_comments: 0,
          organization: 1,
          status: 0,
        },
      },
      creating: false,
      errorMessage: null,
      detailsId: null,
      listViewState: {
        allVisibleSelected: false,
        groupBy: 'workbatch',
        pagination: {pageLinks: undefined},
        search: 'workbatch.name:',
        selectedIds: new Set(),
        visibleIds: [1],
      },
      loading: false,
      loadingDetails: false,
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
      detailsId: null,
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
      loadingDetails: false,
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
      detailsId: null,
      loadingDetails: false,
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
      entries: [TestStubs.WorkBatch(1), TestStubs.WorkBatch(2)],
    });
    const pageSelectedState = workBatch(afterGetState, {
      type: 'WORK_BATCHES_TOGGLE_SELECT_ALL',
    });
    expect(pageSelectedState.listViewState.selectedIds).toEqual(Set([1, 2]));
  });

  it('should handle WORK_BATCHES_TOGGLE_SELECT_ALL to deselect a visible page', () => {
    const afterGetState = workBatch(initialState, {
      type: 'WORK_BATCHES_GET_SUCCESS',
      entries: [TestStubs.WorkBatch(1), TestStubs.WorkBatch(2)],
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
