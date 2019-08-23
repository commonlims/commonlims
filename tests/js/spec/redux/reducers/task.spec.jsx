import task from 'app/redux/reducers/task';

describe('task reducer', () => {
  const mockTask = {
    id: 1,
    name: 'Fragment Analyze',
    organization: 1,
    num_samples: 175,
  };

  it('should handle initial state', () => {
    expect(task(undefined, {})).toEqual({
      loading: false,
      errorMessage: null,
      tasks: [],
    });
  });

  it('should handle TASKS_GET_REQUEST', () => {
    const initialState = {
      loading: false,
      errorMessage: 'oops',
    };

    const state = task(initialState, {
      type: 'TASKS_GET_REQUEST',
    });

    expect(state).toEqual({
      loading: true,
      errorMessage: null,
    });
  });

  it('should handle TASKS_GET_SUCCESS', () => {
    const initialState = {
      loading: true,
      errorMessage: 'oops',
    };

    const state = task(initialState, {
      type: 'TASKS_GET_SUCCESS',
      tasks: [mockTask],
    });

    expect(state).toEqual({
      tasks: [mockTask],
      errorMessage: null,
      loading: false,
    });
  });

  it('should handle TASKS_GET_FAILURE', () => {
    const initialState = {
      loading: true,
    };

    const state = task(initialState, {
      type: 'TASKS_GET_FAILURE',
      message: 'oopsiedoodle',
    });

    expect(state).toEqual({
      loading: false,
      errorMessage: 'oopsiedoodle',
    });
  });
});
