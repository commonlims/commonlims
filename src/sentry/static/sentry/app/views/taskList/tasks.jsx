import PropTypes from 'prop-types';
import styled from 'react-emotion';
import {Flex} from 'grid-emotion';
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
        <Sticky>
          <StyledFlex py={1} px={0} align="center">
            <Flex flex="1">
              <Flex w={200} mx={2} justify="flex-start">
                Step name
              </Flex>
            </Flex>
            <Flex w={200} mx={2} justify="flex-start">
              Num samples
            </Flex>
            <Flex w={200} mx={2} justify="flex-end" />
          </StyledFlex>
        </Sticky>
        <PanelBody>{this.renderBody()}</PanelBody>
      </Panel>
    );
  }
}

const Sticky = styled.div`
  position: sticky;
  z-index: ${p => p.theme.zIndex.header};
  top: -1px;
`;

const StyledFlex = styled(Flex)`
  align-items: center;
  background: ${p => p.theme.offWhite};
  border-bottom: 1px solid ${p => p.theme.borderDark};
  border-radius: ${p => p.theme.borderRadius} ${p => p.theme.borderRadius} 0 0;
  margin-bottom: -1px;
`;

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
