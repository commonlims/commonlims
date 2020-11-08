import ClimsTypes from 'app/climsTypes';
import React from 'react';
import withOrganization from 'app/utils/withOrganization';
import {connect} from 'react-redux';
import {resourceActionCreators} from 'app/redux/actions/shared';
import LoadingIndicator from 'app/components/loadingIndicator';
import {WORK_BATCH, WORK_BATCH_DEFINITION, EVENTS} from 'app/redux/reducers/index';

class WorkbatchDetails extends React.Component {
  constructor(props) {
    super(props);
    this.fetchStaticContentsFromWip = this.fetchStaticContentsFromWip.bind(this);
    const getWipWorkbatch = this.props.getWipWorkbatch;
    const org = this.props.organization;
    Promise.all([getWipWorkbatch(org)]).then(this.fetchStaticContentsFromWip);
  }

  fetchStaticContentsFromWip() {
    const byIds = this.props.workBatchEntry.byIds;
    const arr = Object.values(byIds);
    let wipWorkbatch = arr[0];
    this.props.getConfiguredStaticContents(
      this.props.organization,
      wipWorkbatch.cls_full_name
    );
  }

  render() {
    //TODO: merge this with files in the workBatchDetails folder
    const buttonsFromConfig = [];
    let workBatchDefinitionEntry = this.props.workBatchDefinitionEntry;
    if (workBatchDefinitionEntry == null) {
      return <LoadingIndicator />;
    }
    let {byIds, detailsId} = workBatchDefinitionEntry;
    if (detailsId == null) {
      return <LoadingIndicator />;
    }
    const workDefinition = byIds[detailsId];
    let {buttons: buttonDefinitions, id: configId} = workDefinition;
    for (const entry of buttonDefinitions) {
      const buttonClick = () => {
        this.sendButtonClickedEvent(entry.name, configId);
      };
      buttonsFromConfig.push(
        <button
          className="btn btn-sm btn-default"
          onClick={buttonClick}
          name={entry.name}
        >
          {entry.caption}
        </button>
      );
    }
    return (
      <div>
        <h1>Workbatch details proxy</h1>
        {buttonsFromConfig}
      </div>
    );
  }

  sendButtonClickedEvent(clickedButtonName, workBatchId) {
    const buttonEvent = {
      event: clickedButtonName,
      workBatchId,
    };
    this.props.sendButtonClickedEvent(this.props.organization, buttonEvent);
  }
}

WorkbatchDetails.propTypes = {
  ...ClimsTypes.List,
  organization: ClimsTypes.Organization.isRequired,
};

const mapStateToProps = (state) => ({
  workBatchDefinitionEntry: state.workBatchDefinitionEntry,
  workBatchEntry: state.workBatchEntry,
});

const mockedWorkDefinition = {
  id: 2,
  buttons: [
    {
      name: 'button1',
      caption: 'button 1',
    },
    {
      name: 'button2',
      caption: 'Button 2',
    },
  ],
};
const mapDispatchToProps = (dispatch) => ({
  sendButtonClickedEvent: (org, buttonEvent) => {
    const urlTemplate = '/api/0/organizations/{org}/events/';
    const sendButtonClickedEventRoutine = resourceActionCreators.acCreate(
      EVENTS,
      urlTemplate
    );
    dispatch(sendButtonClickedEventRoutine(org, buttonEvent));
  },
  getConfiguredStaticContents: (org, workbatchId) => {
    const urlTemplate = '/api/0/organizations/{org}/work-batch-definition-details/{id}';
    const getConfiguredStaticContentsRoutine = resourceActionCreators.acGet(
      WORK_BATCH_DEFINITION,
      urlTemplate
    );
    dispatch(getConfiguredStaticContentsRoutine(org, workbatchId));
  },
  getWipWorkbatch: (org) => {
    const urlTemplate = '/api/0/organizations/{org}/work-batches/';
    const getWorkBatchRoutine = resourceActionCreators.acGetList(WORK_BATCH, urlTemplate);
    return dispatch(getWorkBatchRoutine(org, 'workbatch.name:wip-workbatch'));
  },
});

export default withOrganization(
  connect(mapStateToProps, mapDispatchToProps)(WorkbatchDetails)
);
