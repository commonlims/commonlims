import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {t} from 'app/locale';
import {tasksGet} from 'app/redux/actions/task';
import {Panel, PanelBody} from 'app/components/panels';
import TaskListItem from 'app/components/task/taskListItem';
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
      body = this.renderTasks(tasks);
    } else {
      body = this.renderEmpty();
    }
    return body;
  }

  renderTasks() {
    const {tasks} = this.props;
    const items = tasks.map((task, i) => {
      const {count, name, processKey} = task;
      return <TaskListItem name={name} count={count} processKey={processKey} key={i} />;
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
