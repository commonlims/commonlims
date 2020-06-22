import React from 'react';
import createReactClass from 'create-react-class';
import {browserHistory} from 'react-router';

import SentryTypes from 'app/sentryTypes';
import ApiMixin from 'app/mixins/apiMixin';
import LoadingError from 'app/components/loadingError';
import LoadingIndicator from 'app/components/loadingIndicator';
import Pagination from 'app/components/pagination';
import SearchBar from 'app/components/searchBar';
import ProcessesTable from 'app/components/processesTable';
import {t, tct} from 'app/locale';
import withEnvironment from 'app/utils/withEnvironment';
import {getQueryEnvironment, getQueryStringWithEnvironment} from 'app/utils/queryString';
import EnvironmentStore from 'app/stores/environmentStore';
import {setActiveEnvironment} from 'app/actionCreators/environments';
import EmptyStateWarning from 'app/components/emptyStateWarning';
import {Panel, PanelBody} from 'app/components/panels';

const SampleProcesses = createReactClass({
  displayName: 'SampleProcesses',

  propTypes: {
    environment: SentryTypes.Environment,
  },

  mixins: [ApiMixin],

  getInitialState() {
    const queryParams = this.props.location.query;

    const initialState = {
      sampleProcesses: [],
      loading: true,
      error: false,
      pageLinks: '',
      query: queryParams.query || '',
    };

    // If an environment is specified in the query, update the global environment
    // Otherwise if a global environment is present update the query
    const queryEnvironment = EnvironmentStore.getByName(
      getQueryEnvironment(queryParams.query || '')
    );

    if (queryEnvironment) {
      setActiveEnvironment(queryEnvironment);
    } else if (this.props.environment) {
      const newQuery = getQueryStringWithEnvironment(
        initialState.query,
        this.props.environment.name
      );
      this.handleSearch(newQuery);
    }

    return initialState;
  },

  UNSAFE_componentWillMount() {
    this.fetchData();
  },

  componentWillReceiveProps(nextProps) {
    // If query has changed, update the environment with the query environment
    if (nextProps.location.search !== this.props.location.search) {
      const queryParams = nextProps.location.query;

      const queryEnvironment = EnvironmentStore.getByName(
        getQueryEnvironment(queryParams.query || '')
      );

      if (queryEnvironment) {
        setActiveEnvironment(queryEnvironment);
      }

      this.setState(
        {
          query: queryParams.query,
        },
        this.fetchData
      );
    }

    // If environment has changed, update query with new environment
    if (nextProps.environment !== this.props.environment) {
      const newQueryString = getQueryStringWithEnvironment(
        nextProps.location.query.query || '',
        nextProps.environment ? nextProps.environment.name : null
      );
      this.handleSearch(newQueryString);
    }
  },

  handleSearch(query) {
    const targetQueryParams = {};
    if (query !== '') {
      targetQueryParams.query = query;
    }

    const {groupId, orgId, projectId} = this.props.params;
    browserHistory.push({
      pathname: `/${orgId}/${projectId}/issues/${groupId}/events/`,
      query: targetQueryParams,
    });
  },

  fetchData() {
    this.setState({
      loading: true,
      error: false,
    });
    const query = {...this.props.location.query, limit: 50, query: this.state.query};

    this.api.request(`/samples/${this.props.params.sampleId}/processes/`, {
      query,
      method: 'GET',
      success: (data, _, jqXHR) => {
        this.setState({
          sampleProcesses: data,
          error: false,
          loading: false,
          pageLinks: jqXHR.getResponseHeader('Link'),
        });
      },
      error: (err) => {
        let error = err.responseJSON || true;
        error = error.detail || true;
        this.setState({
          error,
          loading: false,
        });
      },
    });
  },

  renderNoQueryResults() {
    const {environment} = this.props;
    const message = environment
      ? tct('Sorry, no events match your search query in the [env] environment.', {
          env: environment.displayName,
        })
      : t('Sorry, no events match your search query.');

    return (
      <EmptyStateWarning>
        <p>{message}</p>
      </EmptyStateWarning>
    );
  },

  renderEmpty() {
    const {environment} = this.props;
    const message = environment
      ? tct("There don't seem to be any events in the [env] environment yet.", {
          env: environment.displayName,
        })
      : t("There don't seem to be any events yet.");
    return (
      <EmptyStateWarning>
        <p>{t(message)}</p>
      </EmptyStateWarning>
    );
  },

  renderResults() {
    return (
      <ProcessesTable processes={this.state.sampleProcesses} params={this.props.params} />
    );
  },

  renderBody() {
    let body;

    if (this.state.loading) {
      body = <LoadingIndicator />;
    } else if (this.state.error) {
      body = <LoadingError message={this.state.error} onRetry={this.fetchData} />;
    } else if (this.state.sampleProcesses.length > 0) {
      body = this.renderResults();
    } else if (this.state.query && this.state.query !== '') {
      body = this.renderNoQueryResults();
    } else {
      body = this.renderEmpty();
    }

    return body;
  },

  render() {
    return (
      <div>
        <div style={{marginBottom: 20}}>
          <SearchBar
            defaultQuery=""
            placeholder={t('search event id, message, or tags')}
            query={this.state.query}
            onSearch={this.handleSearch}
          />
        </div>
        <Panel className="event-list">
          <PanelBody>{this.renderBody()}</PanelBody>
        </Panel>
        <Pagination pageLinks={this.state.pageLinks} />
      </div>
    );
  },
});

export {SampleProcesses}; // For tests
export default withEnvironment(SampleProcesses);
