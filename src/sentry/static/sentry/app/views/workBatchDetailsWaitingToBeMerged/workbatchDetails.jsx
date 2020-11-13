import ClimsTypes from 'app/climsTypes';
import React from 'react';
import withOrganization from 'app/utils/withOrganization';
import {connect} from 'react-redux';
import {resourceActionCreators} from 'app/redux/actions/shared';
import LoadingIndicator from 'app/components/loadingIndicator';
import PropTypes from 'prop-types';
import DetailsForm from './detailsForm';

import {
  WORK_BATCH,
  WORK_BATCH_DETAILS,
  WORK_BATCH_DEFINITION,
  EVENTS,
} from 'app/redux/reducers/index';

class WorkbatchDetails extends React.Component {
  constructor(props) {
    super(props);
    this.fetchStaticContentsFromWip = this.fetchStaticContentsFromWip.bind(this);
    this.fetchDetailedContentFromWip = this.fetchDetailedContentFromWip.bind(this);
    this.sendButtonClickedEvent = this.sendButtonClickedEvent.bind(this);
    this.setFetched = this.setFetched.bind(this);
    this.initState = this.initState.bind(this);
    const getWipWorkbatch = this.props.getWipWorkbatch;
    const org = this.props.organization;
    getWipWorkbatch(org)
      .then(this.fetchStaticContentsFromWip)
      .then(this.fetchDetailedContentFromWip)
      .then(this.initState)
      .then(this.setFetched);
  }

  initState() {
    return new Promise((resolve) => {
      this.setState({}, resolve);
    });
  }

  setFetched() {
    this.setState({fetched: true});
  }

  fetchStaticContentsFromWip() {
    const byIds = this.props.workBatchEntry.byIds;
    const arr = Object.values(byIds);
    let wipWorkbatch = arr[0];
    return this.props.getConfiguredStaticContents(
      this.props.organization,
      wipWorkbatch.cls_full_name
    );
  }

  fetchDetailedContentFromWip() {
    const byIds = this.props.workBatchEntry.byIds;
    const arr = Object.values(byIds);
    let wipWorkbatch = arr[0];
    return this.props.getWorkBatchDetails(this.props.organization, wipWorkbatch.id);
  }

  fetchDefinitionsFromProps() {
    let workBatchDefinitionEntry = this.props.workBatchDefinitionEntry;
    if (workBatchDefinitionEntry == null) {
      return null;
    }
    let {byIds, detailsId} = workBatchDefinitionEntry;
    if (detailsId == null) {
      return null;
    }
    let workDefinition = byIds[detailsId];
    let {fields, buttons, id} = workDefinition;
    if (fields === null || buttons === null || id === null) {
      return null;
    }
    return workDefinition;
  }

  sendButtonClickedEvent(buttonEvent) {
    this.props.sendButtonClickedEvent(this.props.organization, buttonEvent);
  }

  render() {
    //TODO: merge this with files in the workBatchDetails folder
    if (
      this.props.workBatchDetailsEntry.loadingDetails ||
      this.state === null ||
      !this.state.fetched
    ) {
      return <LoadingIndicator />;
    }
    let workDefinition = this.fetchDefinitionsFromProps();
    if (workDefinition === null) {
      return <LoadingIndicator />;
    }
    let {detailsId: workbatchId} = this.props.workBatchDetailsEntry;
    return (
      <DetailsForm
        workDefinition={workDefinition}
        sendButtonClickedEvent={this.sendButtonClickedEvent}
        workBatchId={workbatchId}
      />
    );
  }
}

WorkbatchDetails.propTypes = {
  ...ClimsTypes.List,
  organization: ClimsTypes.Organization.isRequired,
};

const mapStateToProps = (state) => ({
  workBatchDefinitionEntry: state.workBatchDefinitionEntry,
  workBatchEntry: state.workBatchEntry,
  workBatchDetailsEntry: state.workBatchDetailsEntry,
});

const mapDispatchToProps = (dispatch) => ({
  sendButtonClickedEvent: (org, buttonEvent) => {
    const urlTemplate = '/api/0/organizations/{org}/events/';
    const sendButtonClickedEventRoutine = resourceActionCreators.acCreate(
      EVENTS,
      urlTemplate
    );
    return dispatch(sendButtonClickedEventRoutine(org, buttonEvent));
  },
  getConfiguredStaticContents: (org, workbatchId) => {
    const urlTemplate = '/api/0/organizations/{org}/work-batch-definition-details/{id}';
    const getConfiguredStaticContentsRoutine = resourceActionCreators.acGet(
      WORK_BATCH_DEFINITION,
      urlTemplate
    );
    dispatch(getConfiguredStaticContentsRoutine(org, workbatchId));
  },
  getWorkBatchDetails: (org, workbatchId) => {
    const urlTemplate = '/api/0/organizations/{org}/work-batch-details/{id}';
    const getWorkBatchDetialsRoutine = resourceActionCreators.acGet(
      WORK_BATCH_DETAILS,
      urlTemplate
    );
    return dispatch(getWorkBatchDetialsRoutine(org, workbatchId));
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
