import React from 'react';

import OrganizationWorkBatchList from 'app/components/organizationWorkBatchList';
import {t} from 'app/locale';

class Viewed extends React.Component {
  getEndpoint = () => {
    return `/organizations/${this.props.params.orgId}/members/me/issues/viewed/`;
  };

  getTitle = () => {
    return t('History');
  };

  render() {
    return (
      <OrganizationWorkBatchList
        title={this.getTitle()}
        endpoint={this.getEndpoint()}
        emptyText={t('No recently viewed issues.')}
        {...this.props}
      />
    );
  }
}

export default Viewed;
