import PropTypes from 'prop-types';
import React from 'react';
//import {connect} from 'react-redux';
import {t} from 'app/locale';
import {workUnitsGet} from 'app/redux/actions/workUnit';
import {Panel, PanelBody} from 'app/components/panels';
import ProcessListItem from 'app/components/workUnit/processListItem';
import LoadingError from 'app/components/loadingError';
import LoadingIndicator from 'app/components/loadingIndicator';

export class WorkUnits extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const {getWorkUnits} = this.props;
    getWorkUnits();
  }

  renderBody() {
    const {workUnits, loading, errorMessage, getWorkUnits} = this.props;

    let body;
    if (loading) {
      body = this.renderLoading();
    } else if (errorMessage) {
      body = <LoadingError message={errorMessage} onRetry={getWorkUnits} />;
    } else if (workUnits.length > 0) {
      body = this.renderProcesses();
    } else {
      body = this.renderEmpty();
    }
    return body;
  }

  groupWorkUnitsByProcess(workUnits) {
    const processes = workUnits.reduce((r, workUnit) => {
      const {
        count,
        name,
        processDefinitionKey,
        processDefinitionName,
        workDefinitionKey,
      } = workUnit;

      const prunedWorkUnit = {count, name, workDefinitionKey};

      r[processDefinitionKey] = r[processDefinitionKey]
        ? {...r[processDefinitionKey]}
        : {
            workUnits: [],
            count: 0,
            processDefinitionKey,
            processDefinitionName,
          };
      r[processDefinitionKey].count += count;
      r[processDefinitionKey].workUnits.push(prunedWorkUnit);

      return r;
    }, {});

    const arrProcesses = [];
    for (const key in processes) {
      arrProcesses.push(processes[key]);
    }

    return arrProcesses;
  }

  renderProcesses() {
    const {workUnits} = this.props;
    const processes = this.groupWorkUnitsByProcess(workUnits);

    const items = processes.map((p, i) => {
      return <ProcessListItem {...p} key={i} />;
    });

    return <PanelBody className="ref-group-list">{items}</PanelBody>;
  }

  renderLoading() {
    return <LoadingIndicator />;
  }

  renderEmpty() {
    const message = t('Sorry, no workUnits match your filters.');

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

WorkUnits.propTypes = {
  getWorkUnits: PropTypes.func,
  workUnits: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      workDefinitionKey: PropTypes.string.isRequired,
      processDefinitionKey: PropTypes.string.isRequired,
      processDefinitionName: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
  errorMessage: PropTypes.string,
};
WorkUnits.displayName = 'WorkUnits';

export default WorkUnits;
