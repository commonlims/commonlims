import ClimsTypes from 'app/climsTypes';
import React from 'react';
import withOrganization from 'app/utils/withOrganization';
import {connect} from 'react-redux';
import {resourceActionCreators} from 'app/redux/actions/shared';
import LoadingIndicator from 'app/components/loadingIndicator';
import moxios from 'moxios';
import {WORK_DEFINITION, EVENTS} from 'app/redux/reducers/index';

class ExampleWorkbatchContainer extends React.Component {
  constructor(props) {
    super(props);
    this.props.getWorkDefinition(
      this.props.organization,
      'clims.plugins.demo.dnaseq.configuration.my_fancy_step.MyFancyStep'
    );
  }

  render() {
    const buttonsFromConfig = [];
    let workDefinitionEntry = this.props.workDefinitionEntry;
    if (workDefinitionEntry == null) {
      return <LoadingIndicator />;
    }
    let {byIds, detailsId} = workDefinitionEntry;
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

ExampleWorkbatchContainer.propTypes = {
  ...ClimsTypes.List,
  organization: ClimsTypes.Organization.isRequired,
};

const mapStateToProps = (state) => {
  return {
    workDefinitionEntry: state.workDefinitionEntry,
  };
};

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
  getWorkDefinition: (org, cls_full_name) => {
    const urlTemplate = '/api/0/organizations/{org}/work-definition-details/{id}';
    const getWorkDefinitionRoutine = resourceActionCreators.acGet(
      WORK_DEFINITION,
      urlTemplate
    );
    // TODO: remove this mock response
    moxios.install();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: mockedWorkDefinition,
        headers: [],
      });
    });
    dispatch(getWorkDefinitionRoutine(org, cls_full_name));
  },
});

export default withOrganization(
  connect(mapStateToProps, mapDispatchToProps)(ExampleWorkbatchContainer)
);
