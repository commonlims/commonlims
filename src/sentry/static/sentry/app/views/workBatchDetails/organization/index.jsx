import React from 'react';
import SentryTypes from 'app/sentryTypes';

import withOrganization from 'app/utils/withOrganization';
import GlobalSelectionHeader from 'app/components/organizations/globalSelectionHeader';
import {PageContent} from 'app/styles/organization';
import Feature from 'app/components/acl/feature';

import WorkBatchDetails from '../shared/workBatchDetails';
import WorkBatchStore from 'app/stores/workBatchStore';

class OrganizationWorkBatchDetails extends React.Component {
  static propTypes = {
    organization: SentryTypes.Organization,
  };

  render() {
    const {...props} = this.props;
    return (
      <PageContent>
        <WorkBatchDetails {...props} />
      </PageContent>
    );
  }
}

export default withOrganization(OrganizationWorkBatchDetails);
