import {Set} from 'immutable';
import workDefinition, {initialState} from 'app/redux/reducers/workDefinition';
import {workDefinitionActions} from 'app/redux/actions/workDefinition';

describe('workDefinition reducer, list protocol', () => {
  it('has expected state after requesting getting a list', () => {
    const requested = workDefinition(
      initialState,
      workDefinitionActions.getListRequest('search', 'groupBy', 'cursor')
    );
    const expected = {
      loading: true,
      errorMessage: null,
      byIds: {},
      listViewState: {
        allVisibleSelected: false,
        visibleIds: [],
        selectedIds: Set(),
        search: 'search',
        groupBy: 'groupBy',
        pagination: {
          pageLinks: null,
          cursor: 'cursor',
        },
      },
      creating: false,
      loadingDetails: false,
      detailsId: null,
    };
    expect(requested).toEqual(expected);
  });

  it('expected state after ListSuccess', () => {
    const requested = workDefinition(
      initialState,
      workDefinitionActions.getListRequest('search', 'groupBy', 'cursor')
    );
    const entries = [TestStubs.WorkDefinition(1), TestStubs.WorkDefinition(2)];
    const succeeded = workDefinition(
      requested,
      workDefinitionActions.getListSuccess(entries, 'pageLinks')
    );

    const expected = {
      loading: false,
      errorMessage: null,
      byIds: {
        1: entries[0],
        2: entries[1],
      },
      listViewState: {
        allVisibleSelected: false,
        visibleIds: [entries[0].id, entries[1].id],
        selectedIds: Set(),
        search: 'search',
        groupBy: 'groupBy',
        pagination: {
          pageLinks: 'pageLinks',
          cursor: 'cursor',
        },
      },
      creating: false,
      loadingDetails: false,
      detailsId: null,
    };
    expect(succeeded).toEqual(expected);
  });
});
