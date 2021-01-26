import PropTypes from 'prop-types';
import React from 'react';
import {t} from 'app/locale';
import {Panel, PanelBody} from 'app/components/panels';
import {browserHistory} from 'react-router';
import ProcessListItem from './processListItem';
import LoadingError from 'app/components/loadingError';
import LoadingIndicator from 'app/components/loadingIndicator';
import {groupBy, sum} from 'lodash';
import ClimsTypes from 'app/climsTypes';
import {workDefinitionActions} from 'app/redux/actions/workDefinitionEntry';

export class WorkDefinitions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderBody() {
    const {
      workDefinitions,
      workUnitsLoading,
      errorMessage,
      getWorkDefinitionList,
    } = this.props;

    let body;
    if (workUnitsLoading) {
      body = this.renderLoading();
    } else if (errorMessage) {
      body = (
        <LoadingError
          message={errorMessage}
          onRetry={() => getWorkDefinitionList(this.props.organization)}
        />
      );
    } else if (workDefinitions.length > 0) {
      body = this.renderProcesses();
    } else {
      body = this.renderEmpty();
    }
    return body;
  }

  groupWorkUnitsByProcess(workDefinitions) {
    const ret = [];
    const grouped = groupBy(workDefinitions, (x) => x.processDefinitionKey);
    for (const [processDefinitionKey, workUnits] of Object.entries(grouped)) {
      const entry = {
        workUnits,
        count: sum(workUnits.map((x) => x.count)),
        processDefinitionKey,
        processDefinitionName: workUnits[0].processDefinitionName,
      };
      ret.push(entry);
    }
    return ret;
  }

  renderProcesses() {
    // TODO: This method has to be cleaned up
    const {workDefinitions} = this.props;
    const workDefinitionsGroupedByProcess = this.groupWorkUnitsByProcess(workDefinitions);

    const items = workDefinitionsGroupedByProcess.map((p, i) => {
      return (
        <ProcessListItem
          {...p}
          key={i}
          selectWorkDefinition={(workDefinition) =>
            this.onWorkUnitSelected.bind(this)(workDefinition)
          }
        />
      );
    });

    return <PanelBody className="ref-group-list">{items}</PanelBody>;
  }

  onWorkUnitSelected(workUnit) {
    this.props.selectWorkDefinition(workUnit);
  }

  renderLoading() {
    return <LoadingIndicator />;
  }

  renderEmpty() {
    const message = t('Sorry, no data was found.');

    return (
      <div className="empty-stream" style={{border: 0}}>
        <p>
          <span className="icon icon-exclamation" /> {message}
        </p>
      </div>
    );
  }

  render() {
    return (
      <Panel>
        <PanelBody>{this.renderBody()}</PanelBody>
      </Panel>
    );
  }
}

WorkDefinitions.propTypes = {
  getWorkDefinitionList: PropTypes.func,
  workUnits: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      workDefinitionKey: PropTypes.string.isRequired,
      processDefinitionKey: PropTypes.string.isRequired,
      processDefinitionName: PropTypes.string,
    })
  ),
  workUnitsLoading: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  selectWorkDefinition: PropTypes.func.isRequired,
  workDefinitions: PropTypes.arrayOf(ClimsTypes.WorkDefinition).isRequired,
  organization: ClimsTypes.Organization.isRequired,
};
WorkDefinitions.displayName = 'WorkDefinitions';

export default WorkDefinitions;
