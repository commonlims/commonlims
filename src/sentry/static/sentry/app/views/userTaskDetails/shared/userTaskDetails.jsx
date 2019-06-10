import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import { browserHistory } from 'react-router';
import DocumentTitle from 'react-document-title';
import * as Sentry from '@sentry/browser';

import ApiMixin from 'app/mixins/apiMixin';
import UserTaskStore from 'app/stores/userTaskStore';
import UserTaskSettingsStore from 'app/stores/userTaskSettingsStore';
import LoadingError from 'app/components/loadingError';
import LoadingIndicator from 'app/components/loadingIndicator';
import SentryTypes from 'app/sentryTypes';
import { t } from 'app/locale';

import UserTaskHeader from './header';
import { ERROR_TYPES } from './constants';

import UserTaskDetailsFields from 'app/views/userTaskDetails/shared/userTaskFields';
import UserTaskDetailsFiles from 'app/views/userTaskDetails/shared/userTaskFiles';
import UserTaskDetailsActivity from 'app/views/userTaskDetails/shared/userTaskActivity';
import SampleTransitioner from 'app/components/sampleTransitioner/sampleTransitioner'

const UserTaskDetails = createReactClass({
  displayName: 'UserTaskDetails',

  propTypes: {
    // Provided in the project version of group details
    project: SentryTypes.Project,
    environment: SentryTypes.Environment,
  },

  childContextTypes: {
    location: PropTypes.object,
  },

  mixins: [ApiMixin, Reflux.listenTo(UserTaskStore, 'onUserTaskChange')],

  getInitialState() {
    return {
      userTask: null,
      loading: true,
      error: false,
      errorType: null,
    };
  },

  getChildContext() {
    return {
      location: this.props.location,
    };
  },

  componentWillMount() {
    this.fetchData();
  },

  componentDidUpdate(prevProps) {
    if (
      prevProps.params.groupId !== this.props.params.groupId ||
      prevProps.environment !== this.props.environment
    ) {
      this.fetchData();
    }
  },

  remountComponent() {
    this.setState(this.getInitialState());
  },

  fetchData() {
    // TODO: Consider moving fetchData to a client called by the store rather than
    // initializing the store in this way
    const query = {};

    if (this.props.environment) {
      query.environment = this.props.environment.name;
    }

    this.api.request(this.getUserTaskDetailsEndpoint(), {
      query,
      success: data => {
        // TODO: hacking, use promises
        this.setState({
          loading: false,
          error: false,
          errorType: null,
        });
        return void UserTaskStore.loadInitialData(data);
      },
      error: (_, _textStatus, errorThrown) => {
        let errorType = null;
        switch (errorThrown) {
          case 'NOT FOUND':
            errorType = ERROR_TYPES.GROUP_NOT_FOUND;
            break;
          default:
        }
        this.setState({
          loading: false,
          error: true,
          errorType,
        });
      },
    });
  },

  onUserTaskChange() {
    let id = this.props.params.groupId; // TODO: Rename to userTaskId
    if (UserTaskStore.userTask.id === id) {
      this.setState({
        userTask: UserTaskStore.userTask,
      });
    }
  },

  getUserTaskDetailsEndpoint() {
    let id = this.props.params.groupId;
    return '/user-tasks/' + id + '/';
  },

  getTitle() {
    let userTask = this.state.userTask;

    if (!userTask) return 'Sentry';

    switch (userTask.type) {
      case 'error':
        if (userTask.metadata.type && userTask.metadata.value)
          return `${userTask.metadata.type}: ${userTask.metadata.value}`;
        return userTask.metadata.type || userTask.metadata.value;
      case 'csp':
        return userTask.metadata.message;
      case 'expectct':
      case 'expectstaple':
      case 'hpkp':
        return userTask.metadata.message;
      case 'default':
        return userTask.metadata.title;
      default:
        return '';
    }
  },

  subtaskManualClick(subtask) {
    UserTaskStore.setSubtaskManualOverride(subtask.view, !subtask.manualOverride);
  },

  subtaskTitleClick(subtask) {
    UserTaskStore.activateView(subtask.view);
  },

  renderTodoItems() {
    let ret = this.state.userTask.subtasks.map(x => {
      return <TodoItem
        handleManualClick={() => this.subtaskManualClick(x)}
        handleTitleClick={() => this.subtaskTitleClick(x)}
        description={x.description}
        key={x.description}
        status={x.status}
        manualOverride={x.manualOverride} />
    });
    return ret;

  },

  activeTab() {
    for (let tab of this.state.userTask.tabs) {
      if (tab.active) {
        return tab;
      }
    }
  },

  renderTabComponent() {
    let tab = this.activeTab();
    if (tab.id == 'samples') {
      return <SampleTransitioner sampleBatch={this.state.userTask.sampleBatch} />
    }
    else if (tab.id == "details") {
      return <UserTaskDetailsFields userTask={this.state.userTask} />
    }
    else if (tab.id == "files") {
      return <UserTaskDetailsFiles userTask={this.state.userTask} />
    }
    else if (tab.id == "activity") {
      return <UserTaskDetailsActivity userTask={this.state.userTask} />
    }
  },

  render() {
    let params = this.props.params;
    let { userTask } = this.state;

    if (this.state.error) {
      switch (this.state.errorType) {
        case ERROR_TYPES.GROUP_NOT_FOUND:
          return (
            <div className="alert alert-block">
              {t('The issue you were looking for was not found.')}
            </div>
          );
        default:
          return <LoadingError onRetry={this.remountComponent} />;
      }
    } else if (this.state.loading || !userTask) return <LoadingIndicator />;

    return (
      <DocumentTitle title={this.getTitle()}>
        <div className={this.props.className}>
          <UserTaskHeader params={params} userTask={this.state.userTask} />
          <div className="user-task-details-container">
            <div className="primary">
              {this.renderTabComponent()}
            </div>
            <div className="secondary">
              <div className="user-task-todo-container">
                <h6>Task list</h6>
                {this.renderTodoItems()}
              </div>
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  },
});

const TodoItem = props => {
  let icon = 'icon-checkmark';
  if (props.status === 'error') {
    icon = 'icon-ban';
  }

  let status = props.status;
  if (props.manualOverride) {
    status = "manual";
  }

  return (
    <div className="todo-item">
      <a className="btn btn-default btn-sm" onClick={props.handleManualClick}>
        <span className={`${icon} ${status}`} />
      </a>
      <span className="description">
        <a onClick={props.handleTitleClick}>{props.description}</a>
      </span>
    </div>
  );
};

TodoItem.propTypes = {
  status: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default UserTaskDetails;
