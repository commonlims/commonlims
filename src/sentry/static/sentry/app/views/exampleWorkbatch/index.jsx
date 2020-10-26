import ClimsTypes from 'app/climsTypes';
import React from 'react';
import withOrganization from 'app/utils/withOrganization';
import {connect} from 'react-redux';
import {resourceActionCreators} from 'app/redux/actions/shared';
import LoadingIndicator from 'app/components/loadingIndicator';
import moxios from 'moxios';
import {WORK_CONFIGURATION, EVENTS} from 'app/redux/reducers/index';

class ExampleWorkbatchContainer extends React.Component {
  constructor(props) {
    super(props);
    this.props.getWorkConfiguration(
      this.props.organization,
      'clims.plugins.demo.dnaseq.configuration.my_fancy_step.MyFancyStep'
    );
  }

  render() {
    const buttonsFromConfig = [];
    let workConfigurationEntry = this.props.workConfigurationEntry;
    if (workConfigurationEntry == null) {
      return <LoadingIndicator />;
    }
    let {byIds, detailsId} = workConfigurationEntry;
    if (detailsId == null) {
      return <LoadingIndicator />;
    }
    const workConfiguration = byIds[detailsId];
    let {buttons: buttonConfigurations, id: configId} = workConfiguration;
    for (const entry of buttonConfigurations) {
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
    workConfigurationEntry: state.workConfigurationEntry,
  };
};

const mockedWorkConfiguration = {
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
  getWorkConfiguration: (org, cls_full_name) => {
    const urlTemplate = '/api/0/organizations/{org}/work-definition-details/{id}';
    const getWorkConfigurationRoutine = resourceActionCreators.acGet(
      WORK_CONFIGURATION,
      urlTemplate
    );
    // TODO: remove this mock response
    moxios.install();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: mockedWorkConfiguration,
        headers: [],
      });
    });
    dispatch(getWorkConfigurationRoutine(org, id));
  },
});

export default withOrganization(
  connect(mapStateToProps, mapDispatchToProps)(ExampleWorkbatchContainer)
);
