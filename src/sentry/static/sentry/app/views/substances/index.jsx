import React from 'react';
import PropTypes from 'prop-types';
import Substances from 'app/views/substances/substances';
import {connect} from 'react-redux';
import withOrganization from 'app/utils/withOrganization';
import {getOrganizationState} from 'app/mixins/organizationState';

class SubstancesContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    // TODO: Consider using react for all of this data
    const access = getOrganizationState(this.props.organization).getAccess();

    return (
      <Substances
        organization={this.props.organization}
        access={access}
        location={this.props.location}
      />
    );
  }
}

const mapStateToProps = (state) => state.tag;
const mapDispatchToProps = (dispatch) => ({});

SubstancesContainer.propTypes = {
  organization: PropTypes.object.isRequired,
};
SubstancesContainer.displayName = 'SubstancesContainer';

export default withOrganization(
  connect(mapStateToProps, mapDispatchToProps)(SubstancesContainer)
);
