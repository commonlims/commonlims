import {Set} from 'immutable';
import workDefinition, {initialState} from 'app/redux/reducers/workDefinition';
import {workDefinitionActions} from 'app/redux/actions/workDefinition';

describe('workDefinition reducer, entry protocol', () => {
  it('has expected state after requesting an item', () => {
    const requested = workDefinition(
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
    const requested = workDefinition(
      initialState,
      workDefinitionActions.getRequest('id')
    );
    const entry = TestStubs.WorkDefinition('work-definition-name');
    const succeeded = workDefinition(requested, workDefinitionActions.getSuccess(entry));

    const expected = {
      loadingDetails: false,
      entry: entry,
      updating: false,
    };
    expect(succeeded).toEqual(expected);
  });
});
