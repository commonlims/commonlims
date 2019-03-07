import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import {browserHistory} from 'react-router';
import DocumentTitle from 'react-document-title';
import * as Sentry from '@sentry/browser';

import ApiMixin from 'app/mixins/apiMixin';
import UserTaskStore from 'app/stores/userTaskStore';
import LoadingError from 'app/components/loadingError';
import LoadingIndicator from 'app/components/loadingIndicator';
import SentryTypes from 'app/sentryTypes';
import {t} from 'app/locale';
import ProjectsStore from 'app/stores/projectsStore';

import UserTaskHeader from './header';
import {ERROR_TYPES} from './constants';

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
      group: null,
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.groupId !== this.props.params.groupId) {
      this.remountComponent();
    }
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
    const query = {};

    if (this.props.environment) {
      query.environment = this.props.environment.name;
    }

    this.api.request(this.getUserTaskDetailsEndpoint(), {
      query,
      success: data => {
        // TODO: Ideally, this would rebuild the route before parameter
        // interpolation, replace the `groupId` field of `this.routeParams`,
        // and use `formatPattern` from `react-router` to rebuild the URL,
        // rather than blindly pattern matching like we do here. Unfortunately,
        // `formatPattern` isn't actually exported until `react-router` 2.0.1:
        // https://github.com/reactjs/react-router/blob/v2.0.1/modules/index.js#L25
        if (this.props.params.groupId != data.id) {
          let location = this.props.location;
          return void browserHistory.push(
            location.pathname.replace(
              `/issues/${this.props.params.groupId}/`,
              `/issues/${data.id}/`
            ) +
              location.search +
              location.hash
          );
        }

        let project = this.props.project || ProjectsStore.getById(data.project.id);

        if (!project) {
          Sentry.withScope(scope => {
            Sentry.captureException(new Error('Project not found'));
          });
        }

        this.setState({
          loading: false,
          error: false,
          errorType: null,
          project,
        });

        return void UserTaskStore.loadInitialData([data]);
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

  onUserTaskChange(itemIds) {
    let id = this.props.params.groupId;
    if (itemIds.has(id)) {
      let group = UserTaskStore.get(id);
      if (group) {
        if (group.stale) {
          this.fetchData();
          return;
        }
        this.setState({
          group,
        });
      }
    }
  },

  getUserTaskDetailsEndpoint() {
    let id = this.props.params.groupId;

    return '/issues/' + id + '/';
  },

  getTitle() {
    let group = this.state.group;

    if (!group) return 'Sentry';

    switch (group.type) {
      case 'error':
        if (group.metadata.type && group.metadata.value)
          return `${group.metadata.type}: ${group.metadata.value}`;
        return group.metadata.type || group.metadata.value;
      case 'csp':
        return group.metadata.message;
      case 'expectct':
      case 'expectstaple':
      case 'hpkp':
        return group.metadata.message;
      case 'default':
        return group.metadata.title;
      default:
        return '';
    }
  },

  render() {
    let params = this.props.params;
    let {group, project} = this.state;

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
    } else if (this.state.loading || !group) return <LoadingIndicator />;

    return (
      <DocumentTitle title={this.getTitle()}>
        <div className={this.props.className}>
          <UserTaskHeader params={params} project={project} group={group} />
          <div className="user-task-details-container">
            <div className="primary">
              {React.cloneElement(this.props.children, {
                group,
                project,
              })}
            </div>
            <div className="secondary">
              <div className="user-task-todo-container">
                <h6>Task list</h6>
                <TodoItem description="Place samples" status="todo" />
                <TodoItem description="Print labels" status="done" />
                <TodoItem description="Fill required fields" status="manual" />
                <TodoItem description="Prepare QA plate" status="todo" />
                <TodoItem description="Run fragment analyzer" status="todo" />
                <TodoItem description="All samples passed QA" status="error" />
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
  return (
    <div className="todo-item">
      <a className="btn btn-default btn-sm">
        <span className={`${icon} ${props.status}`} />
      </a>
      <span className="description">
        <a>{props.description}</a>
      </span>
    </div>
  );
};

TodoItem.propTypes = {
  status: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default UserTaskDetails;
