import {browserHistory} from 'react-router';
import {mount} from 'enzyme';
import React from 'react';

import OrganizationGeneralSettings from 'app/views/settings/organizationGeneralSettings';

jest.mock('jquery');

jest.mock('react-router', () => {
  return {
    browserHistory: {
      push: jest.fn(),
      replace: jest.fn(),
    },
  };
});

describe('OrganizationGeneralSettings', function() {
  const org = TestStubs.Organization();
  const ENDPOINT = `/organizations/${org.slug}/`;
  beforeEach(function() {
    MockApiClient.clearMockResponses();
    MockApiClient.addMockResponse({
      url: ENDPOINT,
      body: TestStubs.Organization(),
    });
    browserHistory.push.mockReset();
    browserHistory.replace.mockReset();
  });

  it('has LoadingError on error', async function() {
    MockApiClient.clearMockResponses();
    MockApiClient.addMockResponse({
      url: ENDPOINT,
      statusCode: 500,
      body: {},
    });
    const wrapper = mount(
      <OrganizationGeneralSettings params={{orgId: org.slug}} />,
      TestStubs.routerContext()
    );

    await tick();
    wrapper.update();
    expect(wrapper.find('LoadingIndicator')).toHaveLength(0);
    expect(wrapper.find('LoadingError')).toHaveLength(1);
  });

  it('can enable "early adopter"', async function() {
    const wrapper = mount(
      <OrganizationGeneralSettings params={{orgId: org.slug}} />,
      TestStubs.routerContext()
    );
    const mock = MockApiClient.addMockResponse({
      url: ENDPOINT,
      method: 'PUT',
    });

    wrapper.setState({loading: false});
    await tick();
    wrapper.update();
    wrapper.find('Switch[id="isEarlyAdopter"]').simulate('click');
    expect(mock).toHaveBeenCalledWith(
      ENDPOINT,
      expect.objectContaining({
        data: {isEarlyAdopter: true},
      })
    );
  });

  it('changes org slug and redirects to new slug', async function() {
    const wrapper = mount(
      <OrganizationGeneralSettings params={{orgId: org.slug}} />,
      TestStubs.routerContext()
    );
    const mock = MockApiClient.addMockResponse({
      url: ENDPOINT,
      method: 'PUT',
    });

    wrapper.setState({loading: false});

    await tick();
    wrapper.update();
    // Change slug
    wrapper
      .find('input[id="slug"]')
      .simulate('change', {target: {value: 'new-slug'}})
      .simulate('blur');

    wrapper.find('SaveButton').simulate('click');
    expect(mock).toHaveBeenCalledWith(
      ENDPOINT,
      expect.objectContaining({
        data: {slug: 'new-slug'},
      })
    );

    await tick();
    // Not sure why this needs to be async, but it does
    expect(browserHistory.replace).toHaveBeenCalledWith('/settings/new-slug/');
  });

  it('disables the entire form if user does not have write access', async function() {
    const readOnlyOrg = TestStubs.Organization({access: ['org:read']});
    MockApiClient.clearMockResponses();
    MockApiClient.addMockResponse({
      url: ENDPOINT,
      body: readOnlyOrg,
    });
    const wrapper = mount(
      <OrganizationGeneralSettings routes={[]} params={{orgId: readOnlyOrg.slug}} />,
      TestStubs.routerContext([{organization: readOnlyOrg}])
    );

    wrapper.setState({loading: false});
    await tick();
    wrapper.update();

    expect(wrapper.find('Form FormField[disabled=false]')).toHaveLength(0);
    expect(
      wrapper
        .find('PermissionAlert')
        .first()
        .text()
    ).toEqual(
      'These settings can only be edited by users with the owner or manager role.'
    );
  });

  it('does not have remove organization button', async function() {
    MockApiClient.clearMockResponses();
    MockApiClient.addMockResponse({
      url: ENDPOINT,
      body: TestStubs.Organization({
        projects: [{slug: 'project'}],
        access: ['org:write'],
      }),
    });
    const wrapper = mount(
      <OrganizationGeneralSettings params={{orgId: org.slug}} />,
      TestStubs.routerContext()
    );

    wrapper.setState({loading: false});
    await tick();
    wrapper.update();
    expect(wrapper.find('Confirm[priority="danger"]')).toHaveLength(0);
  });

  it('can remove organization when org admin', async function() {
    MockApiClient.clearMockResponses();
    MockApiClient.addMockResponse({
      url: ENDPOINT,
      body: TestStubs.Organization({
        projects: [{slug: 'project'}],
        access: ['org:admin'],
      }),
    });
    const wrapper = mount(
      <OrganizationGeneralSettings params={{orgId: org.slug}} />,
      TestStubs.routerContext()
    );
    const mock = MockApiClient.addMockResponse({
      url: ENDPOINT,
      method: 'DELETE',
    });

    wrapper.setState({loading: false});
    await tick();
    wrapper.update();
    wrapper.find('Confirm[priority="danger"]').simulate('click');

    // Lists projects in modal
    expect(wrapper.find('Modal .ref-projects')).toHaveLength(1);
    expect(wrapper.find('Modal .ref-projects li').text()).toBe('project');

    // Confirm delete
    wrapper.find('Modal Portal Button[priority="danger"]').simulate('click');
    expect(mock).toHaveBeenCalledWith(
      ENDPOINT,
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  it('returns to "off" if switch enable fails (e.g. API error)', async function() {
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/',
      method: 'PUT',
      statusCode: 500,
    });

    const wrapper = mount(
      <OrganizationGeneralSettings params={{orgId: org.slug}} />,
      TestStubs.routerContext([
        {
          organization: TestStubs.Organization({
            features: ['require-2fa'],
          }),
        },
      ])
    );

    wrapper.setState({loading: false});
    await tick();
    wrapper.update();
  });
});
