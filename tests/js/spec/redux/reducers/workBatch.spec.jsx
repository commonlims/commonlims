import workBatch from 'app/redux/reducers/workBatch';

describe('workBatch reducer', () => {
  const mockWorkBatch = {
    id: 4,
    name: 'Test3',
    organization: 1,
    handler: 'somehandler2',
    created: '2019-06-12T13:07:13.490Z',
    extra_fields: '',
    num_comments: 0,
    status: 0,
  };

  it('should handle initial state', () => {
    expect(workBatch(undefined, {})).toEqual({
      loading: false,
      errorMessage: null,
      workBatches: [],
    });
  });

  it('should handle WORK_BATCHES_GET_REQUEST', () => {
    const initialState = {
      loading: false,
      errorMessage: 'oops',
    };

    const state = workBatch(initialState, {
      type: 'WORK_BATCHES_GET_REQUEST',
    });

    expect(state).toEqual({
      loading: true,
      errorMessage: null,
    });
  });

  it('should handle WORK_BATCHES_GET_SUCCESS', () => {
    const initialState = {
      loading: true,
      errorMessage: 'oops',
    };

    const state = workBatch(initialState, {
      type: 'WORK_BATCHES_GET_SUCCESS',
      workBatches: [mockWorkBatch],
    });

    expect(state).toEqual({
      workBatches: [mockWorkBatch],
      errorMessage: null,
      loading: false,
    });
  });

  it('should handle WORK_BATCHES_GET_FAILURE', () => {
    const initialState = {
      loading: true,
    };

    const state = workBatch(initialState, {
      type: 'WORK_BATCHES_GET_FAILURE',
      message: 'oopsiedoodle',
    });

    expect(state).toEqual({
      loading: false,
      errorMessage: 'oopsiedoodle',
    });
  });

  it('should handle WORK_BATCH_TOGGLE_SELECT to select a workBatch', () => {
    const initialState = {
      workBatches: [mockWorkBatch],
    };

    const state = workBatch(initialState, {
      type: 'WORK_BATCH_TOGGLE_SELECT',
      id: 4,
    });

    const updatedWorkBatch = Object.assign({}, mockWorkBatch);
    updatedWorkBatch.selected = true;

    expect(state).toEqual({
      workBatches: [updatedWorkBatch],
    });
  });

  it('should handle WORK_BATCH_TOGGLE_SELECT to de-select a workBatch', () => {
    const utSelected = Object.assign({}, mockWorkBatch);
    utSelected.selected = true;

    const initialState = {
      workBatches: [utSelected],
    };

    const state = workBatch(initialState, {
      type: 'WORK_BATCH_TOGGLE_SELECT',
      id: 4,
    });

    const utDeselected = Object.assign({}, mockWorkBatch);
    utDeselected.selected = false;

    expect(state).toEqual({
      workBatches: [utDeselected],
    });
  });

  it('should handle WORK_BATCHES_TOGGLE_SELECT_ALL to select or de-select all workBatches', () => {
    const initialState = {
      workBatches: [
        {
          id: 1,
        },
        {
          id: 2,
        },
      ],
    };

    let state = workBatch(initialState, {
      type: 'WORK_BATCHES_TOGGLE_SELECT_ALL',
      doSelect: true,
    });

    expect(state).toEqual({
      workBatches: [
        {
          id: 1,
          selected: true,
        },
        {
          id: 2,
          selected: true,
        },
      ],
    });

    state = workBatch(initialState, {
      type: 'WORK_BATCHES_TOGGLE_SELECT_ALL',
      doSelect: false,
    });

    expect(state).toEqual({
      workBatches: [
        {
          id: 1,
          selected: false,
        },
        {
          id: 2,
          selected: false,
        },
      ],
    });
  });
});
