import React from 'react';
import {shallow} from 'enzyme';

import {Tasks} from 'app/views/taskList/tasks';
import ProcessListItem from 'app/components/task/processListItem';

describe('Tasks', function() {
  let mockProps;
  let getTasks;
  let tasks;
  let loading;
  let errorMessage;

  const task1 = {
    name: 'Task1',
    count: 2,
    taskDefinitionKey: 'task1',
    processDefinitionKey: 'process1',
    processDefinitionName: 'Process1',
  };

  const task2 = {
    name: 'Task2',
    count: 3,
    taskDefinitionKey: 'task2',
    processDefinitionKey: 'process2',
    processDefinitionName: 'Process2',
  };

  const task3 = {
    name: 'Task3',
    count: 3,
    taskDefinitionKey: 'task3',
    processDefinitionKey: 'process1',
    processDefinitionName: 'Process1',
  };

  beforeEach(() => {
    getTasks = jest.fn();
    tasks = [];
    loading = false;
    errorMessage = null;

    mockProps = {
      getTasks,
      tasks,
      loading,
      errorMessage,
    };
  });

  const mountTasks = (props = {}) => {
    const mergedProps = {...mockProps, ...props};
    return shallow(<Tasks {...mergedProps} />);
  };

  it('groups tasks by process', () => {
    tasks = [task1, task2, task3];
    const wrapper = mountTasks({tasks});
    const procs = wrapper.find(ProcessListItem);
    expect(procs.length).toBe(2);

    const proc1 = procs.at(0);
    const props1 = proc1.props();
    expect(props1.count).toBe(5);
    expect(props1.processDefinitionName).toBe('Process1');
    expect(props1.processDefinitionKey).toBe('process1');
    expect(props1.tasks).toEqual([
      {name: 'Task1', count: 2, taskDefinitionKey: 'task1'},
      {name: 'Task3', count: 3, taskDefinitionKey: 'task3'},
    ]);

    const proc2 = procs.at(1);
    const props2 = proc2.props();
    expect(props2.count).toBe(3);
    expect(props2.processDefinitionName).toBe('Process2');
    expect(props2.processDefinitionKey).toBe('process2');
    expect(props2.tasks).toEqual([{name: 'Task2', count: 3, taskDefinitionKey: 'task2'}]);
  });
});
