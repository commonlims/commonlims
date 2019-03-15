import React from 'react';

import OrganizationUserTaskList from 'app/components/organizationUserTaskList';
import { t } from 'app/locale';

class AssignedToMe extends React.Component {
  getEndpoint = () => {
    return `/organizations/${this.props.params.orgId}/members/me/issues/assigned/`;
  };

  getTitle = () => {
    return t('Assigned to me');
  };

  render() {
    return (
      <OrganizationUserTaskList
        title={this.getTitle()}
        endpoint={this.getEndpoint()}
        emptyText={t('No issues currently assigned to you.')}
        {...this.props}
      />
    );
  }
}

export default AssignedToMe;
