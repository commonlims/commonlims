import React, {Component} from 'react';
import OrganizationContext from 'app/views/organizationContext';
import ProjectDetailsLayout from 'app/views/projectDetailsLayout';

export default class OrganizationDetails extends Component {
  render() {
    return (
      <OrganizationContext {...this.props}>
        <ProjectDetailsLayout>{this.props.children}</ProjectDetailsLayout>
      </OrganizationContext>
    );
  }
}
