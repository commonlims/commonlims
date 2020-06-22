import React from 'react';
import {shallow} from 'enzyme';

import ProcessListItem from 'app/components/task/processListItem';
import TaskListItem from 'app/components/task/taskListItem';
import {PanelBody} from 'app/components/panels';

describe('ProcessListItem', function () {
  let mockProps;
  let processDefinitionKey;
  let processDefinitionName;
  let count;
  let tasks;

  const task1 = {
    name: 'Task1',
    count: 2,
    taskDefinitionKey: 'task1',
  };

  const task2 = {
    name: 'Task2',
    count: 3,
    taskDefinitionKey: 'task2',
  };

  beforeEach(() => {
    processDefinitionKey = 'process.key';
    processDefinitionName = 'Process';
    count = 5;
    tasks = [];

    mockProps = {
      processDefinitionKey,
      processDefinitionName,
      count,
      tasks,
    };
  });

  const mountProcessListItem = (props = {}) => {
    const mergedProps = {...mockProps, ...props};
    return shallow(<ProcessListItem {...mergedProps} />);
  };

  it('renders a list of tasks', () => {
    const wrapper = mountProcessListItem({tasks: [task1, task2]});
    expect(wrapper.find(TaskListItem).length).toBe(2);
    const taskListItems = wrapper.find(TaskListItem);
    expect(taskListItems.at(0).props().name).toBe('Task1');
    expect(taskListItems.at(0).props().count).toBe(2);
    expect(taskListItems.at(0).props().taskDefinitionKey).toBe('task1');
    expect(taskListItems.at(1).props().name).toBe('Task2');
    expect(taskListItems.at(1).props().count).toBe(3);
    expect(taskListItems.at(1).props().taskDefinitionKey).toBe('task2');
  });

  it('toggles visibility of tasks per process', () => {
    const wrapper = mountProcessListItem({tasks: [task1]});
    expect(wrapper.find(PanelBody).at(0).hasClass('hidden')).toBeFalsy();
    wrapper.find('.process-list-item-header').simulate('click');
    expect(wrapper.find(PanelBody).at(0).hasClass('hidden')).toBeTruthy();
  });
});
