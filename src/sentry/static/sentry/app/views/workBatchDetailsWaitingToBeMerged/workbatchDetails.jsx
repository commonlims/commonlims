import ClimsTypes from 'app/climsTypes';
import React from 'react';
import merge from 'lodash/merge';
import {connect} from 'react-redux';
import withOrganization from 'app/utils/withOrganization';
import {listActionCreators} from 'app/redux/actions/sharedList';
import {entryActionCreators} from 'app/redux/actions/sharedEntry';
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
    let {entry: workDefinition} = this.props.workBatchDefinitionEntry;
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
    let {entry} = this.props.workBatchDetailsEntry;
    let {id} = entry;
    return (
      <DetailsForm
        workDefinition={this.state.workDefinition}
        sendButtonClickedEvent={this.sendButtonClickedEvent}
        handleChange={this.handleChange}
        currentFieldValues={this.state.currentFieldValues}
        workBatchId={id}
      />
    );
  };

  initCurrentFieldValues = () => {
    let {entry: workbatch} = this.props.workBatchDetailsEntry;
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
    const sendButtonClickedEventRoutine = entryActionCreators.acCreate(
      EVENTS,
      urlTemplate
    );
    return dispatch(sendButtonClickedEventRoutine(org, buttonEvent));
  },
  getConfiguredStaticContents: (org, workbatchId) => {
    const urlTemplate = '/api/0/organizations/{org}/work-batch-definition-details/{id}';
    const getConfiguredStaticContentsRoutine = entryActionCreators.acGet(
      WORK_BATCH_DEFINITION,
      urlTemplate
    );
    dispatch(getConfiguredStaticContentsRoutine(org, workbatchId));
  },
  getWorkBatchDetails: (org, workbatchId) => {
    const urlTemplate = '/api/0/organizations/{org}/work-batch-details/{id}';
    const getWorkBatchDetialsRoutine = entryActionCreators.acGet(
      WORK_BATCH_DETAILS,
      urlTemplate
    );
    return dispatch(getWorkBatchDetialsRoutine(org, workbatchId));
  },
  updateWorkBatchDetails: (org, workbatch) => {
    const urlTemplate = '/api/0/organizations/{org}/work-batch-details/{id}';
    const updateWorkBatchDetailsRoutine = entryActionCreators.acUpdate(
      WORK_BATCH_DETAILS,
      urlTemplate
    );
    return dispatch(updateWorkBatchDetailsRoutine(org, workbatch));
  },
  getWipWorkbatch: (org) => {
    const urlTemplate = '/api/0/organizations/{org}/work-batches/';
    const getWorkBatchRoutine = listActionCreators.acGetList(WORK_BATCH, urlTemplate);
    return dispatch(getWorkBatchRoutine(org, 'workbatch.name:snpseq-wip-workbatch'));
  },
});

export function getUpdatedWorkBatch(workBatchDetailsEntry, currentFieldValues) {
  let {entry: fetched_workbatch} = workBatchDetailsEntry;
  let properties = Object.keys(currentFieldValues);
  let updatedProperties = properties.reduce((previous, current) => {
    let entry = {
      name: current,
      value: currentFieldValues[current] ? currentFieldValues[current] : null,
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
