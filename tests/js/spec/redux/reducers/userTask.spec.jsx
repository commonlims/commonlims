import userTask from 'app/redux/reducers/userTask';

describe('userTask reducer', () => {
  const mockUserTask = {
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
    expect(userTask(undefined, {})).toEqual({
      loading: false,
      errorMessage: null,
      userTasks: [],
    });
  });

  it('should handle USER_TASKS_GET_REQUEST', () => {
    const initialState = {
      loading: false,
      errorMessage: 'oops',
    };

    const state = userTask(initialState, {
      type: 'USER_TASKS_GET_REQUEST',
    });

    expect(state).toEqual({
      loading: true,
      errorMessage: null,
    });
  });

  it('should handle USER_TASKS_GET_SUCCESS', () => {
    const initialState = {
      loading: true,
      errorMessage: 'oops',
    };

    const state = userTask(initialState, {
      type: 'USER_TASKS_GET_SUCCESS',
      userTasks: [mockUserTask],
    });

    expect(state).toEqual({
      userTasks: [mockUserTask],
      errorMessage: null,
      loading: false,
    });
  });

  it('should handle USER_TASKS_GET_FAILURE', () => {
    const initialState = {
      loading: true,
    };

    const state = userTask(initialState, {
      type: 'USER_TASKS_GET_FAILURE',
      message: 'oopsiedoodle',
    });

    expect(state).toEqual({
      loading: false,
      errorMessage: 'oopsiedoodle',
    });
  });

  it('should handle USER_TASK_TOGGLE_SELECT to select a userTask', () => {
    const initialState = {
      userTasks: [mockUserTask],
    };

    const state = userTask(initialState, {
      type: 'USER_TASK_TOGGLE_SELECT',
      id: 4,
    });

    const updatedUserTask = Object.assign({}, mockUserTask);
    updatedUserTask.selected = true;

    expect(state).toEqual({
      userTasks: [updatedUserTask],
    });
  });

  it('should handle USER_TASK_TOGGLE_SELECT to de-select a userTask', () => {
    const utSelected = Object.assign({}, mockUserTask);
    utSelected.selected = true;

    const initialState = {
      userTasks: [utSelected],
    };

    const state = userTask(initialState, {
      type: 'USER_TASK_TOGGLE_SELECT',
      id: 4,
    });

    const utDeselected = Object.assign({}, mockUserTask);
    utDeselected.selected = false;

    expect(state).toEqual({
      userTasks: [utDeselected],
    });
  });

  it('should handle USER_TASKS_TOGGLE_SELECT_ALL to select or de-select all userTasks', () => {
    const initialState = {
      userTasks: [
        {
          id: 1,
        },
        {
          id: 2,
        },
      ],
    };

    let state = userTask(initialState, {
      type: 'USER_TASKS_TOGGLE_SELECT_ALL',
      doSelect: true,
    });

    expect(state).toEqual({
      userTasks: [
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

    state = userTask(initialState, {
      type: 'USER_TASKS_TOGGLE_SELECT_ALL',
      doSelect: false,
    });

    expect(state).toEqual({
      userTasks: [
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
