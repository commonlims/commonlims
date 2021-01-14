import {Set} from 'immutable';
import workDefinitionEntry, {initialState} from 'app/redux/reducers/workDefinitionEntry';
import {workDefinitionActions} from 'app/redux/actions/workDefinitionEntry';

describe('workDefinition reducer, entry protocol', () => {
  it('has expected state after requesting an item', () => {
    const requested = workDefinitionEntry(
      initialState,
      workDefinitionActions.getRequest('id')
    );
    const expected = {
      loadingDetails: true,
      entry: null,
      updating: false,
    };
    expect(requested).toEqual(expected);
  });

  it('expected state after get success', () => {
    const requested = workDefinitionEntry(
      initialState,
      workDefinitionActions.getRequest('id')
    );
    const entry = TestStubs.WorkDefinition('work-definition-name');
    const succeeded = workDefinitionEntry(
      requested,
      workDefinitionActions.getSuccess(entry)
    );

    const expected = {
      loadingDetails: false,
      entry: entry,
      updating: false,
    };
    expect(succeeded).toEqual(expected);
  });
});
