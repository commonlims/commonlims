import ClimsTypes from 'app/climsTypes';
import React from 'react';
import withOrganization from 'app/utils/withOrganization';
import {connect} from 'react-redux';
import {resourceActionCreators} from 'app/redux/actions/shared';
import {getWorkBatchDetails} from 'app/redux/actions/workBatchDetails';
import LoadingIndicator from 'app/components/loadingIndicator';

class ExampleWorkbatchContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
  }

ExampleWorkbatchContainer.propTypes = {
  ...ClimsTypes.List,
  organization: ClimsTypes.Organization.isRequired,
};

const mapStateToProps = (state) => {
};

const mapDispatchToProps = (dispatch) => ({
});

export default withOrganization(
  connect(mapStateToProps, mapDispatchToProps)(ExampleWorkbatchContainer)
);
