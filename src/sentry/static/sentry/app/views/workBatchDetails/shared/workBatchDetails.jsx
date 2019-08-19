import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import DocumentTitle from 'react-document-title';

import ApiMixin from 'app/mixins/apiMixin';
import WorkBatchStore from 'app/stores/workBatchStore';
import LoadingError from 'app/components/loadingError';
import LoadingIndicator from 'app/components/loadingIndicator';
import SentryTypes from 'app/sentryTypes';
import {t} from 'app/locale';

import WorkBatchDetailsFields from 'app/views/workBatchDetails/shared/workBatchFields';
import WorkBatchDetailsFiles from 'app/views/workBatchDetails/shared/workBatchFiles';
import WorkBatchDetailsActivity from 'app/views/workBatchDetails/shared/workBatchActivity';
import SampleTransitioner from 'app/components/sampleTransitioner/sampleTransitioner';

import WorkBatchHeader from './header';
import {ERROR_TYPES} from './constants';

const WorkBatchDetails = createReactClass({
  displayName: 'WorkBatchDetails',

  propTypes: {
    // Provided in the project version of group details
    environment: SentryTypes.Environment,
  },

  childContextTypes: {
    location: PropTypes.object,
  },

  mixins: [ApiMixin, Reflux.listenTo(WorkBatchStore, 'onWorkBatchChange')],

  getInitialState() {
    return {
      workBatch: null,
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

    this.api.request(this.getWorkBatchDetailsEndpoint(), {
      query,
      success: data => {
        // TODO: hacking, use promises
        this.setState({
          loading: false,
          error: false,
          errorType: null,
        });
        return void WorkBatchStore.loadInitialData(data);
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

  onWorkBatchChange() {
    const id = this.props.params.groupId; // TODO: Rename to workBatchId
    if (WorkBatchStore.workBatch.id === id) {
      this.setState({
        workBatch: WorkBatchStore.workBatch,
      });
    }
  },

  getWorkBatchDetailsEndpoint() {
    const id = this.props.params.groupId;
    return '/work-batches/' + id + '/';
  },

  getTitle() {
    const workBatch = this.state.workBatch;

    if (!workBatch) {
      return 'Sentry';
    }

    switch (workBatch.type) {
      case 'error':
        if (workBatch.metadata.type && workBatch.metadata.value) {
          return `${workBatch.metadata.type}: ${workBatch.metadata.value}`;
        }
        return workBatch.metadata.type || workBatch.metadata.value;
      case 'csp':
        return workBatch.metadata.message;
      case 'expectct':
      case 'expectstaple':
      case 'hpkp':
        return workBatch.metadata.message;
      case 'default':
        return workBatch.metadata.title;
      default:
        return '';
    }
  },

  subtaskManualClick(subtask) {
    WorkBatchStore.setSubtaskManualOverride(subtask.view, !subtask.manualOverride);
  },

  subtaskTitleClick(subtask) {
    WorkBatchStore.activateView(subtask.view);
  },

  renderTodoItems() {
    const ret = this.state.workBatch.subtasks.map(x => {
      return (
        <TodoItem
          handleManualClick={() => this.subtaskManualClick(x)}
          handleTitleClick={() => this.subtaskTitleClick(x)}
          description={x.description}
          key={x.description}
          status={x.status}
          manualOverride={x.manualOverride}
        />
      );
    });
    return ret;
  },

  activeTab() {
    for (const tab of this.state.workBatch.tabs) {
      if (tab.active) {
        return tab;
      }
    }
    throw new Error('No active tab found');
  },

  renderTabComponent() {
    const tab = this.activeTab();
    if (tab.id == 'samples') {
      return <SampleTransitioner sampleBatch={this.state.workBatch.sampleBatch} />;
    } else if (tab.id == 'details') {
      return <WorkBatchDetailsFields workBatch={this.state.workBatch} />;
    } else if (tab.id == 'files') {
      return <WorkBatchDetailsFiles workBatch={this.state.workBatch} />;
    } else if (tab.id == 'activity') {
      return <WorkBatchDetailsActivity workBatch={this.state.workBatch} />;
    } else {
      throw new Error('Unexpected tab id ' + tab.id);
    }
  },

  render() {
    const params = this.props.params;
    const {workBatch} = this.state;

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
    } else if (this.state.loading || !workBatch) {
      return <LoadingIndicator />;
    }

    return (
      <DocumentTitle title={this.getTitle()}>
        <div className={this.props.className}>
          <WorkBatchHeader params={params} workBatch={this.state.workBatch} />
          <div className="work-batch-details-container">
            <div className="primary">{this.renderTabComponent()}</div>
            <div className="secondary">
              <div className="work-batch-todo-container">
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
    status = 'manual';
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
  handleTitleClick: PropTypes.func.isRequired,
  handleManualClick: PropTypes.func.isRequired,
  manualOverride: PropTypes.bool.isRequired,
};

export default WorkBatchDetails;
