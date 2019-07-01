import tag from 'app/redux/reducers/tag';

describe('tag reducer', () => {
  const tags = {
    tagExample: {
      key: 'tag-example',
      name: 'Tag example',
      values: [],
      predefined: false,
    },
  };

  it('should handle initial state', () => {
    expect(tag(undefined, {})).toEqual({
      loading: false,
      errorMessage: null,
      tags: {},
    });
  });

  it('should handle TAGS_GET_REQUEST', () => {
    const initialState = {
      loading: false,
      errorMessage: 'oops',
    };

    const state = tag(initialState, {
      type: 'TAGS_GET_REQUEST',
    });

    expect(state).toEqual({
      loading: true,
      errorMessage: null,
    });
  });

  it('should handle TAGS_GET_SUCCESS', () => {
    const initialState = {
      loading: true,
      errorMessage: 'oops',
    };

    const state = tag(initialState, {
      type: 'TAGS_GET_SUCCESS',
      tags,
    });

    expect(state).toEqual({
      tags,
      errorMessage: null,
      loading: false,
    });
  });

  it('should handle TAGS_GET_FAILURE', () => {
    const initialState = {
      loading: true,
    };

    const state = tag(initialState, {
      type: 'TAGS_GET_FAILURE',
      message: 'oopsiedoodle',
    });

    expect(state).toEqual({
      loading: false,
      errorMessage: 'oopsiedoodle',
    });
  });
});
