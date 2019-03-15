import React from 'react';
import SentryTypes from 'app/sentryTypes';

import withOrganization from 'app/utils/withOrganization';
import GlobalSelectionHeader from 'app/components/organizations/globalSelectionHeader';
import {PageContent} from 'app/styles/organization';
import Feature from 'app/components/acl/feature';

import UserTaskDetails from '../shared/userTaskDetails';
import UserTaskStore from 'app/stores/userTaskStore';

class OrganizationUserTaskDetails extends React.Component {
  static propTypes = {
    organization: SentryTypes.Organization,
  };

  render() {
    const {...props} = this.props;
    return (
      <PageContent>
        <UserTaskDetails {...props} />
      </PageContent>
    );
  }
}

export default withOrganization(OrganizationUserTaskDetails);
