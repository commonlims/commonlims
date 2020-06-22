import React from 'react';
import createReactClass from 'create-react-class';
import styled from '@emotion/styled';

import OrganizationState from 'app/mixins/organizationState';
import space from 'app/styles/space';

const HomeContainer = createReactClass({
  displayName: 'HomeContainer',

  mixins: [OrganizationState],

  render() {
    return (
      <div className={`${this.props.className || ''} organization-home`}>
        <div className="container">
          <Content>{this.props.children}</Content>
        </div>
      </div>
    );
  },
});

const Content = styled('div')`
  padding-top: ${space(3)};
`;

export default HomeContainer;
