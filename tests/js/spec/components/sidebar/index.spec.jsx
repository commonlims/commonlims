import React from 'react';

import {mount, shallow} from 'enzyme';
import ConfigStore from 'app/stores/configStore';
import SidebarContainer, {Sidebar} from 'app/components/sidebar';

describe('Sidebar', function() {
  let wrapper;
  const routerContext = TestStubs.routerContext();
  const {organization, router} = routerContext.context;
  const user = TestStubs.User();
  const apiMocks = {};

  const createWrapper = props =>
    mount(
      <Sidebar
        organization={organization}
        user={user}
        router={router}
        location={router.location}
        {...props}
      />,
      routerContext
    );

  beforeEach(function() {
    apiMocks.broadcasts = MockApiClient.addMockResponse({
      url: '/broadcasts/',
      body: [TestStubs.Broadcast()],
    });
    apiMocks.broadcastsMarkAsSeen = MockApiClient.addMockResponse({
      url: '/broadcasts/',
      method: 'PUT',
    });
  });

  it('renders', function() {
    wrapper = shallow(
      <Sidebar organization={organization} user={user} router={router} />,
      TestStubs.routerContext()
    );

    expect(wrapper.find('StyledSidebar')).toHaveLength(1);
  });

  it('renders without org and router', function() {
    wrapper = createWrapper({
      organization: null,
      router: null,
    });

    // no org displays user details
    expect(wrapper.find('OrgOrUserName').text()).toContain(user.name);
    expect(wrapper.find('UserNameOrEmail').text()).toContain(user.email);

    wrapper.find('SidebarDropdownActor').simulate('click');
    expect(wrapper.find('OrgAndUserMenu')).toMatchSnapshot();
  });

  it('can toggle collapsed state', async function() {
    wrapper = mount(
      <SidebarContainer organization={organization} user={user} router={router} />,
      routerContext
    );

    expect(wrapper.find('OrgOrUserName').text()).toContain(organization.name);
    expect(wrapper.find('UserNameOrEmail').text()).toContain(user.name);

    wrapper.find('SidebarCollapseItem').simulate('click');
    await tick();
    wrapper.update();

    // Because of HoCs, we can't access the collapsed prop
    // Instead check for `SidebarItemLabel` which doesn't exist in collapsed state
    expect(wrapper.find('SidebarItemLabel')).toHaveLength(0);

    wrapper.find('SidebarCollapseItem').simulate('click');
    await tick();
    wrapper.update();
    expect(wrapper.find('SidebarItemLabel').length).toBeGreaterThan(0);
  });

  it('can have onboarding feature', function() {
    wrapper = mount(
      <SidebarContainer
        organization={{...organization, features: ['onboarding']}}
        user={user}
        router={router}
      />,
      routerContext
    );

    expect(wrapper.find('[data-test-id="onboarding-progress-bar"]')).toHaveLength(1);

    wrapper.find('[data-test-id="onboarding-progress-bar"]').simulate('click');
    wrapper.update();
    expect(wrapper.find('OnboardingStatus SidebarPanel')).toMatchSnapshot();
  });

  describe('SidebarHelp', function() {
    it('can toggle help menu', function() {
      wrapper = createWrapper();
      wrapper.find('HelpActor').simulate('click');
      const menu = wrapper.find('HelpMenu');
      expect(menu).toHaveLength(1);
      expect(menu).toMatchSnapshot();
      expect(menu.find('SidebarMenuItem')).toHaveLength(3);
      wrapper.find('HelpActor').simulate('click');
      expect(wrapper.find('HelpMenu')).toHaveLength(0);
    });
  });

  describe('SidebarDropdown', function() {
    it('can open Sidebar org/name dropdown menu', function() {
      wrapper = createWrapper();
      wrapper.find('SidebarDropdownActor').simulate('click');
      expect(wrapper.find('OrgAndUserMenu')).toHaveLength(1);
      expect(wrapper.find('OrgAndUserMenu')).toMatchSnapshot();
    });

    it('has link to Members settings with `member:write`', function() {
      let org = TestStubs.Organization();
      org = {
        ...org,
        access: [...org.access, 'member:read'],
      };

      wrapper = createWrapper({
        organization: org,
      });
      wrapper.find('SidebarDropdownActor').simulate('click');
      expect(wrapper.find('OrgAndUserMenu')).toHaveLength(1);
      expect(
        wrapper.find('SidebarMenuItem[to="/settings/org-slug/members/"]')
      ).toHaveLength(1);
    });

    it('can open "Switch Organization" sub-menu', function() {
      ConfigStore.set('features', new Set(['organizations:create']));
      jest.useFakeTimers();
      wrapper = createWrapper();
      wrapper.find('SidebarDropdownActor').simulate('click');
      wrapper.find('SwitchOrganizationMenuActor').simulate('mouseEnter');
      jest.advanceTimersByTime(500);
      wrapper.update();
      expect(wrapper.find('SwitchOrganizationMenu')).toHaveLength(1);
      expect(wrapper.find('SwitchOrganizationMenu')).toMatchSnapshot();
      jest.useRealTimers();
    });

    it('has can logout', function() {
      const mock = MockApiClient.addMockResponse({
        url: '/auth/',
        method: 'DELETE',
        status: 204,
      });

      let org = TestStubs.Organization();
      org = {
        ...org,
        access: [...org.access, 'member:read'],
      };

      wrapper = createWrapper({
        organization: org,
        user: TestStubs.User(),
      });
      wrapper.find('SidebarDropdownActor').simulate('click');
      wrapper.find('SidebarMenuItem[data-test-id="sidebarSignout"]').simulate('click');
      expect(mock).toHaveBeenCalled();
    });
  });
});
