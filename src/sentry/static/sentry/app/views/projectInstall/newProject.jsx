import React from 'react';
import createReactClass from 'create-react-class';
import DocumentTitle from 'react-document-title';
import styled from 'react-emotion';
import space from 'app/styles/space';

import OrganizationState from 'app/mixins/organizationState';

import ProjectSelector from 'app/components/projectHeader/projectSelector';

const NewProject = createReactClass({
  displayName: 'NewProject',
  mixins: [OrganizationState],

  render() {
    return (
      <Container>
        <div className="sub-header flex flex-container flex-vertically-centered">
          <div className="p-t-1 p-b-1">
            <ProjectSelector organization={this.getOrganization()} />
          </div>
        </div>
        <div className="container">
          <Content>
            <DocumentTitle title={'Common LIMS'} />
          </Content>
        </div>
      </Container>
    );
  },
});

const Container = styled('div')`
  flex: 1;
  background: #fff;
  margin-bottom: -${space(3)}; /* cleans up a bg gap at bottom */
`;

const Content = styled('div')`
  margin-top: ${space(3)};
`;

export default NewProject;
