import ClimsTypes from 'app/climsTypes';
import React from 'react';
import withOrganization from 'app/utils/withOrganization';
import TaskDefinitions from 'app/views/taskDefinitions/taskDefinitions';
import {connect} from 'react-redux';
import {taskDefinitionActions} from 'app/redux/actions/taskDefinition';

class TaskDefinitionsContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getList(this.props.organization);
  }

  render() {
    const {visibleIds, byIds} = this.props;
    const taskDefinitions = visibleIds.map((id) => byIds[id]);
    return <TaskDefinitions taskDefinitions={taskDefinitions} {...this.props} />;
  }
}

TaskDefinitionsContainer.propTypes = {
  ...ClimsTypes.List,
  organization: ClimsTypes.Organization.isRequired,
};

const mapStateToProps = (state) => {
  return {
    task: state.task,
    taskDefinition: state.taskDefinition,
    byIds: state.taskDefinition.byIds,
    visibleIds: state.taskDefinition.listViewState.visibleIds,
    workBatch: state.workBatch,
  };
};

const mapDispatchToProps = (dispatch) => ({
  getList: (org) => dispatch(taskDefinitionActions.getList(org)),
});

export default withOrganization(
  connect(mapStateToProps, mapDispatchToProps)(TaskDefinitionsContainer)
);