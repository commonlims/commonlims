import React from 'react';
import {mount} from 'enzyme';

import SampleContainer from 'app/components/sampleTransitioner/sampleContainer';
import SampleWell from 'app/components/sampleTransitioner/sampleWell';
import SampleLocation from 'app/components/sampleTransitioner/sampleLocation';
import Sample from 'app/components/sampleTransitioner/sample';

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
    const wrapper = mountSampleContainer({numRows: 2, numColumns: 2});
    expect(wrapper.find(SampleWell).length).toBe(4);
  });

  it('renders a horizontal axis labelled with numbers', () => {
    const wrapper = mountSampleContainer({numColumns: 2});
    const header = wrapper.find('thead th');
    const corner = header.at(0);
    expect(corner.text()).toBe('');
    expect(header.at(1).text()).toBe('1');
    expect(header.at(2).text()).toBe('2');
  });

  it('renders a vertical axis labelled with letters', () => {
    const wrapper = mountSampleContainer({numRows: 3});
    const header = wrapper.find('tbody th');
    expect(header.at(0).text()).toBe('A');
    expect(header.at(1).text()).toBe('B');
    expect(header.at(2).text()).toBe('C');
  });

  it('creates unique keys for all rows and columns', () => {
    const ensureUniqueKeys = items => {
      const keys = {};
      items.forEach(i => {
        expect(keys[i.key()]).toBeFalsy();
        keys[i.key()] = 1;
      });
    };

    const wrapper = mountSampleContainer({numRows: 2, numColumns: 2});
    ensureUniqueKeys(wrapper.find('tr'));
    ensureUniqueKeys(wrapper.find('th'));
    ensureUniqueKeys(wrapper.find(SampleWell));
  });

  it('fills samples into the correct wells', () => {
    const sampleLocation1 = new SampleLocation(1, 0, 0);
    const sample1 = new Sample(1, 'sample1', sampleLocation1);
    const sampleLocation2 = new SampleLocation(1, 1, 1);
    const sample2 = new Sample(2, 'sample2', sampleLocation2);
    const wrapper = mountSampleContainer({
      numRows: 2,
      numColumns: 2,
      samples: [sample1, sample2],
    });
    const sampleWells = wrapper.find(SampleWell);
    expect(sampleWells.at(0).props().containsSampleId).toBe(1);
    expect(sampleWells.at(0).props().location).toMatchObject(sampleLocation1);
    expect(sampleWells.at(1).props().containsSampleId).toBe(null);
    expect(sampleWells.at(1).props().location).toMatchObject(new SampleLocation(1, 0, 1));
    expect(sampleWells.at(2).props().containsSampleId).toBe(null);
    expect(sampleWells.at(2).props().location).toMatchObject(new SampleLocation(1, 1, 0));
    expect(sampleWells.at(3).props().containsSampleId).toBe(2);
    expect(sampleWells.at(3).props().location).toMatchObject(sampleLocation2);
  });
});
