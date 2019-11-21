import React from 'react';
import PropTypes from 'prop-types';
import Projects from 'app/views/projects/projects';
import {connect} from 'react-redux';
import withOrganization from 'app/utils/withOrganization';
import {getOrganizationState} from 'app/mixins/organizationState';

class ProjectsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    // TODO: Consider using react for all of this data
    const access = getOrganizationState(this.props.organization).getAccess();

    return <Projects organization={this.props.organization} access={access} />;
  }
}

const mapStateToProps = state => state.tag;
const mapDispatchToProps = dispatch => ({});

ProjectsContainer.propTypes = {
  organization: PropTypes.object.isRequired,
};
ProjectsContainer.displayName = 'ProjectsContainer';

export default withOrganization(
  connect(mapStateToProps, mapDispatchToProps)(ProjectsContainer)
);
