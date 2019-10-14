import substance from 'app/redux/reducers/substance';

describe('substance reducer', () => {
  const mockSubstance = {
    id: 2,
    version: 2,
    name: 'sample-625012-aliquot',
    properties: {
      comment: {
        id: '4',
        name: 'comment',
        display_name: 'comment',
        value: 'No this actually looks bad',
      },
      flammability: {
        id: '2',
        name: 'flammability',
        display_name: 'flammability',
        value: 0.9,
      },
      sample_type: 'amplicon',
      priority: 'Standard',
      weight: {
        id: '5',
        name: 'weight',
        display_name: 'weight',
        value: 0.5,
      },
      volume: 10,
    },
    type_full_name: 'clims.services.substance.SubstanceBase',
    position: {
      index: 'A:1',
      container: {
        name: 'cont1',
      },
    },
    days_waiting: 56,
  };

  it('should handle initial state', () => {
    expect(substance(undefined, {})).toEqual({
      byIds: {},
      loading: false,
      errorMessage: null,
      substances: [],
    });
  });

  it('should handle SUBSTANCES_GET_REQUEST', () => {
    const initialState = {
      loading: false,
      errorMessage: 'oops',
    };

    const state = substance(initialState, {
      type: 'SUBSTANCES_GET_REQUEST',
    });

    expect(state).toEqual({
      loading: true,
      errorMessage: null,
    });
  });

  it('should handle SUBSTANCES_GET_SUCCESS', () => {
    const initialState = {
      loading: true,
      errorMessage: 'oops',
    };

    const state = substance(initialState, {
      type: 'SUBSTANCES_GET_SUCCESS',
      substances: [mockSubstance],
    });

    expect(state).toEqual({
      substances: [mockSubstance],
      errorMessage: null,
      loading: false,
    });
  });

  it('should handle SUBSTANCES_GET_FAILURE', () => {
    const initialState = {
      loading: true,
    };

    const state = substance(initialState, {
      type: 'SUBSTANCES_GET_FAILURE',
      message: 'oopsiedoodle',
    });

    expect(state).toEqual({
      loading: false,
      errorMessage: 'oopsiedoodle',
    });
  });

  // TODO: Make toggling work
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should handle SUBSTANCE_TOGGLE_SELECT to select a substance', () => {
    const initialState = {
      substances: [mockSubstance],
    };

    const state = substance(initialState, {
      type: 'SUBSTANCE_TOGGLE_SELECT',
      id: 4,
    });

    const updatedSubstance = Object.assign({}, mockSubstance);
    updatedSubstance.selected = true;

    expect(state).toEqual({
      substances: [updatedSubstance],
    });
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should handle SUBSTANCE_TOGGLE_SELECT to de-select a substance', () => {
    const utSelected = Object.assign({}, mockSubstance);
    utSelected.selected = true;

    const initialState = {
      substances: [utSelected],
    };

    const state = substance(initialState, {
      type: 'SUBSTANCE_TOGGLE_SELECT',
      id: 4,
    });

    const utDeselected = Object.assign({}, mockSubstance);
    utDeselected.selected = false;

    expect(state).toEqual({
      substances: [utDeselected],
    });
  });

  it('should handle SUBSTANCES_TOGGLE_SELECT_ALL to select or de-select all substances', () => {
    const initialState = {
      substances: [
        {
          id: 1,
        },
        {
          id: 2,
        },
      ],
    };

    let state = substance(initialState, {
      type: 'SUBSTANCES_TOGGLE_SELECT_ALL',
      doSelect: true,
    });

    expect(state).toEqual({
      substances: [
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

    state = substance(initialState, {
      type: 'SUBSTANCES_TOGGLE_SELECT_ALL',
      doSelect: false,
    });

    expect(state).toEqual({
      substances: [
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
