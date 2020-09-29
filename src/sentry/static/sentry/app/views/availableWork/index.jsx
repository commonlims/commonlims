import ClimsTypes from 'app/climsTypes';
import React from 'react';
import withOrganization from 'app/utils/withOrganization';
import WorkDefinitions from './workDefinitions';
import {connect} from 'react-redux';
import {availableWorkActions} from 'app/redux/actions/availableWork';
import LoadingIndicator from 'app/components/loadingIndicator';

class AvailableWorkView extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getList(this.props.organization);
  }

  render() {
    if (this.props.availableWork.loading) {
      return <LoadingIndicator />;
    }
    const availableWork = this.props.availableWork.listViewState.visibleIds.map(
      (id) => this.props.availableWork.byIds[id]
    );
    return <WorkDefinitions workDefinitions={availableWork} {...this.props} />;
  }
}

AvailableWorkView.propTypes = {
  ...ClimsTypes.List,
  organization: ClimsTypes.Organization.isRequired,
};

const mapStateToProps = (state) => {
  return {
    availableWork: state.availableWork,
  };
};

const mapDispatchToProps = (dispatch) => ({
  getList: (org) => dispatch(availableWorkActions.getList(org.slug)),
});

export default withOrganization(
  connect(mapStateToProps, mapDispatchToProps)(AvailableWorkView)
);
