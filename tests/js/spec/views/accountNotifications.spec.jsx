import React from 'react';

import {mount} from 'enzyme';
import AccountNotifications from 'app/views/settings/account/accountNotifications';

describe('AccountNotifications', function () {
  const url = '/users/me/notifications/';

  beforeEach(function () {
    MockApiClient.addMockResponse({
      url,
      method: 'GET',
      body: {
        workflowNotifications: 1,
        selfAssignOnResolve: false,
        weeklyReports: true,
        deployNotifications: 3,
        personalActivityNotifications: true,
        subscribeByDefault: true,
      },
    });
  });

  afterEach(function () {
    MockApiClient.clearMockResponses();
  });

  it('renders with values from API', function () {
    const wrapper = mount(<AccountNotifications />, TestStubs.routerContext());

    // "Workflow Notifications"
    expect(
      wrapper.find('Field[id="workflowNotifications"] RadioGroup').prop('value')
    ).toBe(1);

    // "Notify Me About my Own Activity"
    expect(
      wrapper.find('Switch[name="personalActivityNotifications"]').prop('isActive')
    ).toBe(true);
  });
});
