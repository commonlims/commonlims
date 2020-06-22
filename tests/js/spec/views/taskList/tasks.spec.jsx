import React from 'react';
import {shallow} from 'enzyme';

import {Tasks} from 'app/views/taskList/tasks';
import ProcessListItem from 'app/components/task/processListItem';
import LoadingIndicator from 'app/components/loadingIndicator';
import LoadingError from 'app/components/loadingError';

describe('Tasks', function () {
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

  it('renders loader while loading data', () => {
    const wrapper = mountTasks({loading: true});
    expect(wrapper.find(LoadingIndicator).length).toBe(1);
  });

  it('renders error component if there is an error loading data', () => {
    const wrapper = mountTasks({errorMessage: 'Oopsy Daisy'});
    const error = wrapper.find(LoadingError);
    expect(error.length).toBe(1);
    const props = error.at(0).props();
    expect(props.message).toBe('Oopsy Daisy');
    expect(props.onRetry).toBe(getTasks);
  });

  it('renders empty component if there are no tasks', () => {
    const wrapper = mountTasks();
    const error = wrapper.find('.empty-stream');
    expect(error.length).toBe(1);
  });
});
