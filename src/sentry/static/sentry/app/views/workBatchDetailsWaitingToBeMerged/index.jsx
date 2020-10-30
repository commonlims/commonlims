import ClimsTypes from 'app/climsTypes';
import React from 'react';
import withOrganization from 'app/utils/withOrganization';
import {connect} from 'react-redux';
import WorkbatchDetails from 'app/views/workBatchDetailsWaitingToBeMerged/workbatchDetails';

class WorkBatchDetailsWaitingToBeMergedContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <WorkbatchDetails>organization=this.props.organization</WorkbatchDetails>;
  }
}

WorkBatchDetailsWaitingToBeMergedContainer.propTypes = {
  ...ClimsTypes.List,
  organization: ClimsTypes.Organization.isRequired,
};

const mapStateToProps = (state) => {};

const mapDispatchToProps = (dispatch) => ({});

export default withOrganization(
  connect(mapStateToProps, mapDispatchToProps)(WorkBatchDetailsWaitingToBeMergedContainer)
);
