import React from 'react';
import {mount} from 'enzyme';

import SampleContainer from 'app/components/sampleTransitioner/sampleContainer';
import SampleWell from 'app/components/sampleTransitioner/sampleWell';

describe('SampleContainer', function() {
  let mockProps;
  let containerId;
  let containerDirectionality;
  let numColumns;
  let numRows;
  let onWellClicked;
  let onWellMouseOver;
  let onMouseOut;

  beforeEach(() => {
    containerId = 1;
    containerDirectionality = 1;
    numColumns = 1;
    numRows = 1;
    onWellClicked = jest.fn();
    onWellMouseOver = jest.fn();
    onMouseOut = jest.fn();
    mockProps = {
      containerId,
      containerDirectionality,
      numColumns,
      numRows,
      onWellClicked,
      onWellMouseOver,
      onMouseOut,
    };
  });

  const mountSampleContainer = (props = {}) => {
    const mergedProps = {...mockProps, ...props};
    return mount(<SampleContainer {...mergedProps} />);
  };

  it('renders a matrix of sample wells corrresponding to the specified number of rows and columns', () => {
    let wrapper = mountSampleContainer({numRows: 2, numColumns: 2});
    expect(wrapper.find(SampleWell).length).toBe(4);
  });
});
