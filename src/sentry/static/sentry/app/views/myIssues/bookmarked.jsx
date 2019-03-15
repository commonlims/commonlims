import React from 'react';

import OrganizationUserTaskList from 'app/components/organizationUserTaskList';
import { t } from 'app/locale';

class Bookmarked extends React.Component {
  getEndpoint = () => {
    return `/organizations/${this.props.params.orgId}/members/me/issues/bookmarked/`;
  };

  getTitle = () => {
    return t('Bookmarks');
  };

  render() {
    return (
      <OrganizationUserTaskList
        title={this.getTitle()}
        endpoint={this.getEndpoint()}
        emptyText={t('You have not bookmarked any issues.')}
        {...this.props}
      />
    );
  }
}

export default Bookmarked;
