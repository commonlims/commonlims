import React from 'react';
import {shallow} from 'enzyme';

import {WorkUnits} from 'app/views/workUnitList/workUnits';
import ProcessListItem from 'app/components/workUnit/processListItem';
import LoadingIndicator from 'app/components/loadingIndicator';
import LoadingError from 'app/components/loadingError';

describe('WorkUnits', function () {
  let mockProps;
  let getWorkUnits;
  let workUnits;
  let loading;
  let errorMessage;

  const workUnit1 = {
    name: 'WorkUnit1',
    count: 2,
    workDefinitionKey: 'workUnit1',
    processDefinitionKey: 'process1',
    processDefinitionName: 'Process1',
  };

  const workUnit2 = {
    name: 'WorkUnit2',
    count: 3,
    workDefinitionKey: 'workUnit2',
    processDefinitionKey: 'process2',
    processDefinitionName: 'Process2',
  };

  const workUnit3 = {
    name: 'WorkUnit3',
    count: 3,
    workDefinitionKey: 'workUnit3',
    processDefinitionKey: 'process1',
    processDefinitionName: 'Process1',
  };

  beforeEach(() => {
    getWorkUnits = jest.fn();
    workUnits = [];
    loading = false;
    errorMessage = null;

    mockProps = {
      getWorkUnits,
      workUnits,
      loading,
      errorMessage,
    };
  });

  const mountWorkUnits = (props = {}) => {
    const mergedProps = {...mockProps, ...props};
    return shallow(<WorkUnits {...mergedProps} />);
  };

  it('groups workUnits by process', () => {
    workUnits = [workUnit1, workUnit2, workUnit3];
    const wrapper = mountWorkUnits({workUnits});
    const procs = wrapper.find(ProcessListItem);

    const proc1 = procs.at(0);
    const props1 = proc1.props();
    expect(props1.count).toBe(5);
    expect(props1.processDefinitionName).toBe('Process1');
    expect(props1.processDefinitionKey).toBe('process1');
    expect(props1.workUnits).toEqual([
      {name: 'WorkUnit1', count: 2, workDefinitionKey: 'workUnit1'},
      {name: 'WorkUnit3', count: 3, workDefinitionKey: 'workUnit3'},
    ]);

    const proc2 = procs.at(1);
    const props2 = proc2.props();
    expect(props2.count).toBe(3);
    expect(props2.processDefinitionName).toBe('Process2');
    expect(props2.processDefinitionKey).toBe('process2');
    expect(props2.workUnits).toEqual([
      {name: 'WorkUnit2', count: 3, workDefinitionKey: 'workUnit2'},
    ]);
  });

  it('renders loader while loading data', () => {
    const wrapper = mountWorkUnits({loading: true});
    expect(wrapper.find(LoadingIndicator).length).toBe(1);
  });

  it('renders error component if there is an error loading data', () => {
    const wrapper = mountWorkUnits({errorMessage: 'Oopsy Daisy'});
    const error = wrapper.find(LoadingError);
    expect(error.length).toBe(1);
    const props = error.at(0).props();
    expect(props.message).toBe('Oopsy Daisy');
    expect(props.onRetry).toBe(getWorkUnits);
  });

  it('renders empty component if there are no workUnits', () => {
    const wrapper = mountWorkUnits();
    const error = wrapper.find('.empty-stream');
    expect(error.length).toBe(1);
  });
});
