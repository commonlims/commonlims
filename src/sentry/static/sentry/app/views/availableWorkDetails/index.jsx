import PropTypes from 'prop-types';
import React from 'react';
import withOrganization from 'app/utils/withOrganization';
import WorkUnits from './workUnits';
import {connect} from 'react-redux';
import {workBatchActions} from 'app/redux/actions/workBatch';
import {workDefinitionActions} from 'app/redux/actions/workDefinition';
import {availableWorkUnitActions} from 'app/redux/actions/availableWorkUnit';
import ClimsTypes from 'app/climsTypes';
import LoadingIndicator from 'app/components/loadingIndicator';
import BackButton from 'app/components/backButton';
import {t} from 'app/locale';

class AvailableWorkDetailsView extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {workDefinitionId} = this.props.routeParams;
    // If we don't have the workUnit definition, we load that too:
    // TODO: check if we have it first
    this.props.getWorkDefinition(this.props.organization.slug, workDefinitionId);
    this.props.getAvailableWorkUnits(workDefinitionId);
  }

  render() {
    const workDefinition = this.props.workDefinition.entry;

    if (workDefinition === null) {
      return <LoadingIndicator />;
    }

    return (
      <div>
        <AvailableWorkDetailsHeader workDefinition={workDefinition} />
        <BackButton to={`/${this.props.organization.slug}/available-work/`}>
          {t('Back to Available Work')}
        </BackButton>
        <WorkUnits {...this.props} />
      </div>
    );
  }
}

function getColumns() {
  return [
    {
      Header: 'Sample name',
      id: 'name',
      // TODO: javascriptify tracked_object => trackedObject
      // TODO: Missing tracked object!
      //accessor: (workUnit) => workUnit.tracked_object.name,
      accessor: (workUnit) => {
        return workUnit.tracked_object.name;
      },
    },
    {
      Header: 'Index',
      id: 'index',
      accessor: (workUnit) =>
        workUnit.tracked_object.location
          ? workUnit.tracked_object.location.index
          : '<No location>',
    },
    {
      Header: 'Container',
      id: 'container',
      accessor: (workUnit) =>
        workUnit.tracked_object.location
          ? workUnit.tracked_object.location.container.name
          : '<No location>',
    },
  ];
}

class AvailableWorkDetailsHeader extends React.Component {
  render() {
    const {name, processDefinitionName} = this.props.workDefinition;
    return (
      <div>
        <h4>
          {processDefinitionName} | {name}
        </h4>
      </div>
    );
  }
}

AvailableWorkDetailsView.propTypes = {
  ...ClimsTypes.List,
  organization: ClimsTypes.Organization.isRequired,

  workDefinitionsByIds: PropTypes.array.isRequired,
  workDefinition: PropTypes.object.isRequired,
  detailsId: PropTypes.string.isRequired,

  getWorkUnits: PropTypes.func.isRequired,
  getWorkDefinition: PropTypes.func.isRequired,
  routeParams: PropTypes.shape({
    processKey: PropTypes.string.isRequired,
    workUnitKey: PropTypes.string.isRequired,
  }).isRequired,
};

const mapStateToProps = (state) => {
  return {
    workBatch: state.workBatch,
    workDefinition: state.workDefinition,
    availableWorkUnit: state.availableWorkUnit,
    creatingWorkBatch: state.workBatch.creating,
    columns: getColumns(),
  };
};

const mapDispatchToProps = (dispatch) => ({
  toggleSingle: (id) => dispatch(availableWorkUnitActions.select(id)),
  toggleAll: () => dispatch(availableWorkUnitActions.selectPage()),
  createWorkBatch: (org, workUnits, onSuccess) =>
    dispatch(workBatchActions.create(org, workUnits, onSuccess)),
  getWorkDefinition: (org, workDefinitionId) => {
    dispatch(workDefinitionActions.get(org, workDefinitionId));
  },
  getAvailableWorkUnits: (workDefinitionId) =>
    dispatch(availableWorkUnitActions.getList(workDefinitionId)),
});

export default withOrganization(
  connect(mapStateToProps, mapDispatchToProps)(AvailableWorkDetailsView)
);
