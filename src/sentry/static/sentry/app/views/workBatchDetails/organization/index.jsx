import React from 'react';
import SentryTypes from 'app/sentryTypes';

import withOrganization from 'app/utils/withOrganization';
import {PageContent} from 'app/styles/organization';

// TODO: Simplify file structure and naming
import WorkBatchDetails from '../shared/workBatchDetails';

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
