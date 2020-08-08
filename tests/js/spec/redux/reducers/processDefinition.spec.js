import {Set} from 'immutable';
import processDefinition, {initialState} from 'app/redux/reducers/processDefinition';
import {processDefinitionActions} from 'app/redux/actions/processDefinition';

describe('processDefinition reducer, list protocol', () => {
  it('switches to loading when request starts', () => {
    const requested = processDefinition(initialState,
      processDefinitionActions.getListRequest());
    const expected = {
      loading: true,
      errorMessage: null,
      byIds: {},
      listViewState: {
        allVisibleSelected: false,
        visibleIds: [],
        selectedIds: Set(),
        search: null,
        groupBy: null,
        pagination: {
          pageLinks: null,
          cursor: null,
        },
      },
      creating: false,
      loadingDetails: false,
      detailsId: null,
    };
    expect(requested).toEqual(expected);
  });

  it.skip('expected state after ListSuccess', () => {
    expect(initialState.loading).toEqual(false);
    const requested = processDefinition(initialState, getProcessDefinitionListRequest());
    const entries = [TestStubs.ProcessDefinition(1), TestStubs.ProcessDefinition(2)];
    const succeeded = processDefinition(
      requested,
      getProcessDefinitionListSuccess(entries)
    );

    const expected = {
      loading: false,
      errorMessage: null,
      byIds: {
        ProcessDefinition1: entries[0],
        ProcessDefinition2: entries[1],
      },
      listViewState: {
        allVisibleSelected: false,
        visibleIds: [entries[0].id, entries[1].id],
        selectedIds: Set(),
        search: undefined,
        groupBy: undefined,
        pagination: {
          pageLinks: undefined,
        },
      },
      creating: false,
      loadingDetails: false,
      detailsId: null,
    };
    expect(succeeded).toEqual(expected);
  });
});
