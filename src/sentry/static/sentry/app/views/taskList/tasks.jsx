import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {t} from 'app/locale';
import {tasksGet} from 'app/redux/actions/task';
import {Panel, PanelBody} from 'app/components/panels';
import ProcessListItem from 'app/components/task/processListItem';
import LoadingError from 'app/components/loadingError';
import LoadingIndicator from 'app/components/loadingIndicator';

class Tasks extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const {getTasks} = this.props;
    getTasks();
  }

  renderBody() {
    const {tasks, loading, errorMessage, getTasks} = this.props;

    let body;
    if (loading) {
      body = this.renderLoading();
    } else if (errorMessage) {
      body = <LoadingError message={errorMessage} onRetry={getTasks} />;
    } else if (tasks.length > 0) {
      body = this.renderProcesses();
    } else {
      body = this.renderEmpty();
    }
    return body;
  }

  groupTasksByProcess() {
    const {tasks} = this.props;
    const processes = {};

    tasks.forEach((task, i) => {
      const {
        count,
        name,
        processDefinitionKey,
        processDefinitionName,
        taskDefinitionKey,
      } = task;

      const prunedTask = {count, name, taskDefinitionKey};

      if (!processes[processDefinitionKey]) {
        processes[processDefinitionKey] = {
          processDefinitionKey,
          processDefinitionName,
          count,
        };
        processes[processDefinitionKey].tasks = [prunedTask];
      } else {
        processes[processDefinitionKey].count += count;
        processes[processDefinitionKey].tasks.push(prunedTask);
      }
    });

    const arrProcesses = [];
    for (let key in processes) {
      arrProcesses.push(processes[key]);
    }

    return arrProcesses;
  }

  renderProcesses() {
    const processes = this.groupTasksByProcess();

    const items = processes.map((p, i) => {
      return <ProcessListItem {...p} key={i} />;
    });

    return <PanelBody className="ref-group-list">{items}</PanelBody>;
  }

  renderLoading() {
    return <LoadingIndicator />;
  }

  renderEmpty() {
    const message = t('Sorry, no tasks match your filters.');

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

Tasks.propTypes = {
  getTasks: PropTypes.func,
  tasks: PropTypes.arrayOf(PropTypes.shape({})),
  loading: PropTypes.bool,
  errorMessage: PropTypes.string,
};
Tasks.displayName = 'Tasks';

const mapStateToProps = state => state.task;

const mapDispatchToProps = dispatch => ({
  getTasks: () => dispatch(tasksGet()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Tasks);
