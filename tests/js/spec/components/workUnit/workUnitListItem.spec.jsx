import React from 'react';
import {shallow} from 'enzyme';

import WorkUnitListItem from 'app/components/workUnit/workUnitListItem';

describe('WorkUnitListItem', function () {
  let mockProps;
  let workDefinitionKey;
  let name;
  let count;

  beforeEach(() => {
    workDefinitionKey = 'workUnit.key';
    name = 'WorkUnit';
    count = 3;

    mockProps = {
      workDefinitionKey,
      name,
      count,
    };
  });

  const mountWorkUnitListItem = (props = {}) => {
    const mergedProps = {...mockProps, ...props};
    return shallow(<WorkUnitListItem {...mergedProps} />);
  };

  it('renders sample count for the workUnit', () => {
    const wrapper = mountWorkUnitListItem();
    expect(wrapper.find('.workUnit-list-item-sample-count').at(0).text()).toBe('3');
  });

  // it('redirects to the select samples view when button is clicked', () => {});
});
