import React from 'react';
import {mount} from 'enzyme';

import SampleWell from 'app/components/sampleTransitioner/sampleWell';
import {LocationState} from 'app/components/sampleTransitioner/location';
import InlineSvg from 'app/components/inlineSvg';

describe('SampleWell', function() {
  let mockProps;
  let onSampleWellClick;
  let onSampleWellHover;

  beforeEach(() => {
    onSampleWellClick = jest.fn();
    onSampleWellHover = jest.fn();
    mockProps = {
      onSampleWellClick,
      onSampleWellHover,
      sampleWellState: LocationState.EMPTY,
    };
  });

  const mountSampleWell = props => {
    return mount(
      <table>
        <tbody>
          <tr>
            <SampleWell {...props} />
          </tr>
        </tbody>
      </table>
    );
  };

  it('renders the correct icon based on well state', function() {
    let props = {...mockProps, sampleWellState: LocationState.EMPTY};
    let wrapper = mountSampleWell(props);
    expect(wrapper.find(InlineSvg).props().src).toBe('icon-well-empty');

    props = {...mockProps, sampleWellState: LocationState.NOT_EMPTY};
    wrapper = mountSampleWell(props);
    expect(wrapper.find(InlineSvg).props().src).toBe('icon-well-full');

    props = {...mockProps, sampleWellState: LocationState.NOT_EMPTY_TRANSITION_SOURCE};
    wrapper = mountSampleWell(props);
    expect(wrapper.find(InlineSvg).props().src).toBe('icon-well-transitioned');

    props = {...mockProps, sampleWellState: LocationState.NOT_EMPTY_TRANSITION_TARGET};
    wrapper = mountSampleWell(props);
    expect(wrapper.find(InlineSvg).props().src).toBe('icon-well-added');
  });

  it('correctly selects or highlights the well', function() {
    let props = {...mockProps};
    let wrapper = mountSampleWell(props);
    let td = wrapper.find('td');
    expect(td.hasClass('sample-well')).toBe(true);
    expect(td.hasClass('selected')).toBe(false);
    expect(td.hasClass('highlighted')).toBe(false);
    expect(td.hasClass('highlighted-background')).toBe(false);

    // isSelected takes precedence over isHighlighted
    props = {...mockProps, isSelected: true, isHighlighted: true};
    wrapper = mountSampleWell(props);
    td = wrapper.find('td');
    expect(td.hasClass('sample-well')).toBe(true);
    expect(td.hasClass('selected')).toBe(true);
    expect(td.hasClass('highlighted')).toBe(false);
    expect(td.hasClass('highlighted-background')).toBe(false);

    props = {...mockProps, isHighlighted: true};
    wrapper = mountSampleWell(props);
    td = wrapper.find('td');
    expect(td.hasClass('sample-well')).toBe(true);
    expect(td.hasClass('selected')).toBe(false);
    expect(td.hasClass('highlighted')).toBe(true);
    expect(td.hasClass('highlighted-background')).toBe(false);

    props = {...mockProps, isHighlightedBackground: true};
    wrapper = mountSampleWell(props);
    td = wrapper.find('td');
    expect(td.hasClass('sample-well')).toBe(true);
    expect(td.hasClass('selected')).toBe(false);
    expect(td.hasClass('highlighted')).toBe(false);
    expect(td.hasClass('highlighted-background')).toBe(true);
  });

  it('invokes click function on click', function() {
    let props = {...mockProps};
    let wrapper = mountSampleWell(props);
    let icon = wrapper.find(InlineSvg);
    icon.simulate('click');
    expect(onSampleWellClick).toHaveBeenCalled();
  });

  it('invokes hover function on hover', function() {
    let props = {...mockProps};
    let wrapper = mountSampleWell(props);
    let icon = wrapper.find(InlineSvg);
    icon.simulate('mouseover');
    expect(onSampleWellHover).toHaveBeenCalled();
  });
});
