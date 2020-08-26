import React from 'react';
import {mount} from 'enzyme';

import SampleWell from 'app/components/sampleTransitioner/sampleWell';
import {SampleLocation} from 'app/components/sampleTransitioner/sampleLocation';
import InlineSvg from 'app/components/inlineSvg';

describe('SampleWell', function () {
  let mockProps;
  let location;
  let onClick;
  let onMouseOver;

  beforeEach(() => {
    location = new SampleLocation(0, 0, 0);
    onClick = jest.fn();
    onMouseOver = jest.fn();
    mockProps = {
      location,
      onClick,
      onMouseOver,
    };
  });

  const mountSampleWell = (props = {}) => {
    const mergedProps = {...mockProps, ...props};
    return mount(
      <table>
        <tbody>
          <tr>
            <SampleWell {...mergedProps} />
          </tr>
        </tbody>
      </table>
    );
  };

  it('renders the empty well icon by default', () => {
    const wrapper = mountSampleWell();
    expect(wrapper.find(InlineSvg).props().src).toBe('icon-well-empty');
  });

  it('renders the full well icon if the well contains a sample', () => {
    const wrapper = mountSampleWell({containsSampleId: 5});
    expect(wrapper.find(InlineSvg).props().src).toBe('icon-well-full');
  });

  it('renders the correct icon if the well is a transition source', () => {
    const wrapper = mountSampleWell({isTransitionSource: true});
    expect(wrapper.find(InlineSvg).props().src).toBe('icon-well-transitioned');
  });

  it('renders the correct icon if the well is a transition target', () => {
    const wrapper = mountSampleWell({isTransitionTarget: true});
    expect(wrapper.find(InlineSvg).props().src).toBe('icon-well-added');
  });

  it('has the sample-well css class by default', () => {
    const wrapper = mountSampleWell();
    const td = wrapper.find('td');
    expect(td.hasClass('sample-well')).toBe(true);
    expect(td.hasClass('selected')).toBe(false);
    expect(td.hasClass('highlighted')).toBe(false);
    expect(td.hasClass('highlighted-background')).toBe(false);
  });

  it('has the sample-well and selected css classes if it is the active transition source', () => {
    const wrapper = mountSampleWell({isActiveTransitionSource: true});
    const td = wrapper.find('td');
    expect(td.hasClass('sample-well')).toBe(true);
    expect(td.hasClass('selected')).toBe(true);
    expect(td.hasClass('highlighted')).toBe(false);
    expect(td.hasClass('highlighted-background')).toBe(false);
  });

  it('has the sample-well and highlighted css classes if it is a transition target of a hovered sample well', () => {
    const wrapper = mountSampleWell({isTransitionTargetOfHoveredSample: true});
    const td = wrapper.find('td');
    expect(td.hasClass('sample-well')).toBe(true);
    expect(td.hasClass('selected')).toBe(false);
    expect(td.hasClass('highlighted')).toBe(true);
    expect(td.hasClass('highlighted-background')).toBe(false);
  });

  it('has the sample-well and highlighted-background css classes if it is in a hovered row or column', () => {
    const wrapper = mountSampleWell({inHoveredRowOrColumn: true});
    const td = wrapper.find('td');
    expect(td.hasClass('sample-well')).toBe(true);
    expect(td.hasClass('selected')).toBe(false);
    expect(td.hasClass('highlighted')).toBe(false);
  });

  it('invokes click handler on click', () => {
    const wrapper = mountSampleWell();
    const icon = wrapper.find(InlineSvg);
    icon.simulate('click');
    expect(onClick).toHaveBeenCalled();
  });

  it('invokes mouseover handler on hover', () => {
    const wrapper = mountSampleWell();
    const icon = wrapper.find(InlineSvg);
    icon.simulate('mouseover');
    expect(onMouseOver).toHaveBeenCalled();
  });
});
