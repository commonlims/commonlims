import ClimsTypes from 'app/climsTypes';
import React from 'react';
import merge from 'lodash/merge';
import {connect} from 'react-redux';
import withOrganization from 'app/utils/withOrganization';
import {listActionCreators} from 'app/redux/actions/sharedList';
import LoadingIndicator from 'app/components/loadingIndicator';
import DetailsForm from './detailsForm';
import {WORK_BATCH_DEFINITION} from 'app/redux/reducers/workBatchDefinitionEntry';
import {WORK_BATCH} from 'app/redux/reducers/workBatchEntry';
import {WORK_BATCH_DETAILS} from 'app/redux/reducers/workBatchDetailsEntry';
import {EVENTS} from 'app/redux/reducers/event';

function WorkBatchDetailsWrapper(props) {
  // class component WorkBatchDetails is here wrapped within a
  // function component, in order to getUpdatedWorkBatch into test.
  const extendedProps = {
    ...props,
    getUpdatedWorkBatch,
  };
  return <WorkbatchDetails {...extendedProps} />;
}

export class WorkbatchDetails extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
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

  sendButtonClickedEvent = (buttonEvent) => {
    let updatedWorkbatch = this.props.getUpdatedWorkBatch(
      this.props.workBatchDetailsEntry,
      this.state.currentFieldValues
    );
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
    const sendButtonClickedEventRoutine = listActionCreators.acCreate(
      EVENTS,
      urlTemplate
    );
    return dispatch(sendButtonClickedEventRoutine(org, buttonEvent));
  },
  getConfiguredStaticContents: (org, workbatchId) => {
    const urlTemplate = '/api/0/organizations/{org}/work-batch-definition-details/{id}';
    const getConfiguredStaticContentsRoutine = listActionCreators.acGet(
      WORK_BATCH_DEFINITION,
      urlTemplate
    );
    dispatch(getConfiguredStaticContentsRoutine(org, workbatchId));
  },
  getWorkBatchDetails: (org, workbatchId) => {
    const urlTemplate = '/api/0/organizations/{org}/work-batch-details/{id}';
    const getWorkBatchDetialsRoutine = listActionCreators.acGet(
      WORK_BATCH_DETAILS,
      urlTemplate
    );
    return dispatch(getWorkBatchDetialsRoutine(org, workbatchId));
  },
  updateWorkBatchDetails: (org, workbatch) => {
    const urlTemplate = '/api/0/organizations/{org}/work-batch-details/{id}';
    const updateWorkBatchDetailsRoutine = listActionCreators.acUpdate(
      WORK_BATCH_DETAILS,
      urlTemplate
    );
    return dispatch(updateWorkBatchDetailsRoutine(org, workbatch));
  },
  getWipWorkbatch: (org) => {
    const urlTemplate = '/api/0/organizations/{org}/work-batches/';
    const getWorkBatchRoutine = listActionCreators.acGetList(WORK_BATCH, urlTemplate);
    return dispatch(getWorkBatchRoutine(org, 'workbatch.name:wip-workbatch'));
  },
});

export function getUpdatedWorkBatch(workBatchDetailsEntry, currentFieldValues) {
  let {detailsId, byIds} = workBatchDetailsEntry;
  let fetched_workbatch = byIds[detailsId];
  let properties = Object.keys(currentFieldValues);
  let updatedProperties = properties.reduce((previous, current) => {
    let entry = {
      name: current,
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
}

export default withOrganization(
  connect(mapStateToProps, mapDispatchToProps)(WorkBatchDetailsWrapper)
);
