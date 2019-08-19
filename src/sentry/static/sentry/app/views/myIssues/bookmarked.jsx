import React from 'react';

import OrganizationWorkBatchList from 'app/components/organizationWorkBatchList';
import {t} from 'app/locale';

class Bookmarked extends React.Component {
  getEndpoint = () => {
    return `/organizations/${this.props.params.orgId}/members/me/issues/bookmarked/`;
  };

  getTitle = () => {
    return t('Bookmarks');
  };

  render() {
    return (
      <OrganizationWorkBatchList
        title={this.getTitle()}
        endpoint={this.getEndpoint()}
        emptyText={t('You have not bookmarked any issues.')}
        {...this.props}
      />
    );
  }
}

export default Bookmarked;
