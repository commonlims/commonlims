import React from 'react';
import {shallow} from 'enzyme';
import InstallPromptBanner from 'app/components/installPromptBanner';

describe('InstallPromptBanner', function () {
  it('renders', function () {
    const project1 = TestStubs.Project();
    const project2 = TestStubs.Project({firstEvent: null});
    const organization = TestStubs.Organization({projects: [project1, project2]});
    const wrapper = shallow(
      <InstallPromptBanner organization={organization} />,
      TestStubs.routerContext()
    );
    expect(wrapper.find('StyledAlert').exists()).toBe(true);
    expect(wrapper.find('div').text()).toContain('Welcome to Common LIMS');
  });

  it('does not render if first event sent', function () {
    const project1 = TestStubs.Project();
    const project2 = TestStubs.Project({firstEvent: '2018-03-18'});
    const organization = TestStubs.Organization({projects: [project1, project2]});
    const wrapper = shallow(
      <InstallPromptBanner organization={organization} />,
      TestStubs.routerContext()
    );
    expect(wrapper.find('StyledAlert').exists()).toBe(false);
  });
});
