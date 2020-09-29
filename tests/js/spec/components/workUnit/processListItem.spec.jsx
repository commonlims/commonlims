import React from 'react';
import {shallow} from 'enzyme';

import ProcessListItem from 'app/components/workUnit/processListItem';
import WorkUnitListItem from 'app/components/workUnit/workUnitListItem';
import {PanelBody} from 'app/components/panels';

describe('ProcessListItem', function () {
  let mockProps;
  let processDefinitionKey;
  let processDefinitionName;
  let count;
  let workUnits;

  const workUnit1 = {
    name: 'WorkUnit1',
    count: 2,
    workDefinitionKey: 'workUnit1',
  };

  const workUnit2 = {
    name: 'WorkUnit2',
    count: 3,
    workDefinitionKey: 'workUnit2',
  };

  beforeEach(() => {
    processDefinitionKey = 'process.key';
    processDefinitionName = 'Process';
    count = 5;
    workUnits = [];

    mockProps = {
      processDefinitionKey,
      processDefinitionName,
      count,
      workUnits,
    };
  });

  const mountProcessListItem = (props = {}) => {
    const mergedProps = {...mockProps, ...props};
    return shallow(<ProcessListItem {...mergedProps} />);
  };

  it('renders a list of workUnits', () => {
    const wrapper = mountProcessListItem({workUnits: [workUnit1, workUnit2]});
    expect(wrapper.find(WorkUnitListItem).length).toBe(2);
    const workUnitListItems = wrapper.find(WorkUnitListItem);
    expect(workUnitListItems.at(0).props().name).toBe('WorkUnit1');
    expect(workUnitListItems.at(0).props().count).toBe(2);
    expect(workUnitListItems.at(0).props().workDefinitionKey).toBe('workUnit1');
    expect(workUnitListItems.at(1).props().name).toBe('WorkUnit2');
    expect(workUnitListItems.at(1).props().count).toBe(3);
    expect(workUnitListItems.at(1).props().workDefinitionKey).toBe('workUnit2');
  });

  it('toggles visibility of workUnits per process', () => {
    const wrapper = mountProcessListItem({workUnits: [workUnit1]});
    expect(wrapper.find(PanelBody).at(0).hasClass('hidden')).toBeFalsy();
    wrapper.find('.process-list-item-header').simulate('click');
    expect(wrapper.find(PanelBody).at(0).hasClass('hidden')).toBeTruthy();
  });
});
