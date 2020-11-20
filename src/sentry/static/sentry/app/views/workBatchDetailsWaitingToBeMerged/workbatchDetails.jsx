import ClimsTypes from 'app/climsTypes';
import React from 'react';
import withOrganization from 'app/utils/withOrganization';
import {connect} from 'react-redux';
import {resourceActionCreators} from 'app/redux/actions/shared';
import LoadingIndicator from 'app/components/loadingIndicator';
import DetailsForm from './detailsForm';
import {WORK_BATCH_DEFINITION} from 'app/redux/reducers/workBatchDefinitionEntry';
import {WORK_BATCH} from 'app/redux/reducers/workBatchEntry';
import {WORK_BATCH_DETAILS} from 'app/redux/reducers/workBatchDetailsEntry';
import {EVENTS} from 'app/redux/reducers/event';

class WorkbatchDetails extends React.Component {
  constructor(props) {
    super(props);
    const getWipWorkbatch = this.props.getWipWorkbatch;
    const org = this.props.organization;
    getWipWorkbatch(org)
      .then(this.fetchStaticContentsFromWip)
      .then(this.fetchDetailedContentFromWip)
      .then(this.initCurrentFieldValues)
      .then(this.fetchDefinitionsFromProps)
      .then(this.setFetched);
  }

  setFetched = () => {
    this.setState({fetched: true});
  };

  fetchStaticContentsFromWip = () => {
    const byIds = this.props.workBatchEntry.byIds;
    const arr = Object.values(byIds);
    let wipWorkbatch = arr[0];
    return this.props.getConfiguredStaticContents(
      this.props.organization,
      wipWorkbatch.cls_full_name
    );
  };

  fetchDetailedContentFromWip = () => {
    const byIds = this.props.workBatchEntry.byIds;
    const arr = Object.values(byIds);
    let wipWorkbatch = arr[0];
    return this.props.getWorkBatchDetails(this.props.organization, wipWorkbatch.id);
  };

  fetchDefinitionsFromProps = () => {
    let workBatchDefinitionEntry = this.props.workBatchDefinitionEntry;
    let {byIds, detailsId} = workBatchDefinitionEntry;
    let workDefinition = byIds[detailsId];
    if (!workDefinition) {
      throw new Error('Something went wrong when parsing static contents');
    }
    let {fields, buttons, id} = workDefinition;
    if (!fields || !buttons || !id) {
      throw new Error('Something went wrong when parsing static contents');
    }
    return new Promise((resolve) => {
      this.setState(
        {
          workDefinition,
        },
        resolve
      );
    });
  };

  getUpdatedWorkbatch = () => {
    let {detailsId, byIds} = this.props.workBatchDetailsEntry;
    let fetched_workbatch = byIds[detailsId];
    let currentFieldValues = this.state.currentFieldValues;
    let properties = Object.keys(currentFieldValues);
    let updatedProperties = properties.reduce((previous, current) => {
      let entry = {
        value: currentFieldValues[current],
      };
      return {
        ...previous,
        [current]: entry,
      };
    }, {});
    let mergedProperties = merge({}, fetched_workbatch.properties, updatedProperties);
    return {
      ...fetched_workbatch,
      properties: mergedProperties,
    };
  };

  sendButtonClickedEvent = (buttonEvent) => {
    let updatedWorkbatch = this.getUpdatedWorkbatch();
    this.props.updateWorkBatchDetails(this.props.organization, updatedWorkbatch);
    this.props.sendButtonClickedEvent(this.props.organization, buttonEvent);
  };

  render = () => {
    //TODO: merge this with files in the workBatchDetails folder
    if (
      this.props.workBatchDetailsEntry.loadingDetails ||
      !this.state ||
      !this.state.fetched
    ) {
      return <LoadingIndicator />;
    }
    if (!this.state.workDefinition) {
      return <LoadingIndicator />;
    }
    let {detailsId: workbatchId} = this.props.workBatchDetailsEntry;
    return (
      <DetailsForm
        workDefinition={this.state.workDefinition}
        sendButtonClickedEvent={this.sendButtonClickedEvent}
        handleChange={this.handleChange}
        currentFieldValues={this.state.currentFieldValues}
        workBatchId={workbatchId}
      />
    );
  };

  initCurrentFieldValues = () => {
    let {detailsId, byIds} = this.props.workBatchDetailsEntry;
    if (!(detailsId in byIds)) {
      throw new Error('No matching entry for detailsId');
    }
    let workbatch = byIds[detailsId];
    let propertyNames = Object.keys(workbatch.properties);
    let currentFieldValues = propertyNames.reduce((previous, attr) => {
      return {
        ...previous,
        [attr]: workbatch.properties[attr].value,
      };
    }, {});
    return new Promise((resolve) => {
      this.setState(
        {
          currentFieldValues,
        },
        resolve
      );
    });
  };

  handleChange = (e) => {
    let {name, value} = e.target;
    this.setState((prevState) => {
      let {currentFieldValues} = {...prevState};
      currentFieldValues[name] = value;
      return {
        currentFieldValues,
      };
    });
  };
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
