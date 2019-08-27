import React from 'react';
import {shallow} from 'enzyme';

import TaskListItem from 'app/components/task/taskListItem';

describe('TaskListItem', function() {
  let mockProps;
  let taskDefinitionKey;
  let name;
  let count;

  beforeEach(() => {
    taskDefinitionKey = 'task.key';
    name = 'Task';
    count = 3;

    mockProps = {
      taskDefinitionKey,
      name,
      count,
    };
  });

  const mountTaskListItem = (props = {}) => {
    const mergedProps = {...mockProps, ...props};
    return shallow(<TaskListItem {...mergedProps} />);
  };

  it('renders sample count for the task', () => {
    const wrapper = mountTaskListItem();
    expect(
      wrapper
        .find('.task-list-item-sample-count')
        .at(0)
        .text()
    ).toBe('3');
  });

  // it('redirects to the select samples view when button is clicked', () => {});
});
