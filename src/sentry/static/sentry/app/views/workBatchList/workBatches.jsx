import {Link, browserHistory} from 'react-router';
import {omit, isEqual} from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import createReactClass from 'create-react-class';
import qs from 'query-string';

import {Panel, PanelBody} from 'app/components/panels';
import {logAjaxError} from 'app/utils/logging';
import {t, tn, tct} from 'app/locale';
import ApiMixin from 'app/mixins/apiMixin';
import ConfigStore from 'app/stores/configStore';
import ProcessStore from 'app/stores/processStore';
import LoadingError from 'app/components/loadingError';
import LoadingIndicator from 'app/components/loadingIndicator';
import Pagination from 'app/components/pagination';
import WorkBatchListActions from 'app/views/workBatchList/actions';
import StreamFilters from 'app/views/stream/filters';
import WorkBatchListItem from 'app/components/workBatch/workBatchListItem';
import StreamSidebar from 'app/views/stream/sidebar';
import TimeSince from 'app/components/timeSince';
import parseLinkHeader from 'app/utils/parseLinkHeader';
import queryString from 'app/utils/queryString';
import utils from 'app/utils';
import ProjectState from 'app/mixins/projectState';
import {connect} from 'react-redux';
import {workBatchesGet, workBatchToggleSelect} from 'app/redux/actions/workBatch';

const MAX_ITEMS = 25;
const DEFAULT_SORT = 'date';
const DEFAULT_STATS_PERIOD = '24h';
const STATS_PERIODS = new Set(['14d', '24h']);

const WorkBatches = createReactClass({
  // This class was based on the Stream class in Sentry

  displayName: 'WorkBatches',

  propTypes: {
    tags: PropTypes.object,
    tagsLoading: PropTypes.bool,
    getWorkBatches: PropTypes.func.isRequired,
    workBatches: PropTypes.arrayOf(PropTypes.shape({})),
    toggleWorkBatchSelect: PropTypes.func,
  },

  mixins: [ApiMixin, ProjectState],

  getInitialState() {
    const searchId = this.props.params.searchId || null;

    const currentQuery = this.props.location.query || {};
    const sort = 'sort' in currentQuery ? currentQuery.sort : DEFAULT_SORT;

    const hasQuery = 'query' in currentQuery;
    const statsPeriod = STATS_PERIODS.has(currentQuery.statsPeriod)
      ? currentQuery.statsPeriod
      : DEFAULT_STATS_PERIOD;

    return {
      groupIds: [],
      isDefaultSearch: false,
      searchId: hasQuery ? null : searchId,
      // if we have no query then we can go ahead and fetch data
      loading: searchId || !hasQuery,
      savedSearchLoading: true,
      savedSearchList: [],
      selectAllActive: false,
      multiSelected: false,
      anySelected: false,
      statsPeriod,
      pageLinks: '',
      queryCount: null,
      dataLoading: true,
      error: false,
      query: hasQuery ? currentQuery.query : '',
      sort,
      isSidebarVisible: false,
      processingIssues: null,
    };
  },

  componentWillMount() {
    // TODO(withrocks): Change to task manager
    // TODO: Why is there both a manager and a store?
    this._processesManager = new utils.ProcessesManager(ProcessStore);

    this.fetchSavedSearches();
    this.fetchProcessingIssues();
    if (!this.state.loading) {
      this.fetchData();
    }
    this.props.getWorkBatches();
  },

  componentWillReceiveProps(nextProps) {
    // you cannot apply both a query and a saved search (our routes do not
    // support it), so the searchId takes priority
    const nextSearchId = nextProps.params.searchId || null;

    const searchIdChanged = this.state.isDefaultSearch
      ? nextSearchId !== null
      : nextSearchId !== this.state.searchId;

    // We are using qs.parse with location.search since this.props.location.query
    // returns the same value as nextProps.location.query
    const currentSearchTerm = qs.parse(this.props.location.search);
    const nextSearchTerm = qs.parse(nextProps.location.search);

    const searchTermChanged = !isEqual(
      omit(currentSearchTerm, 'environment'),
      omit(nextSearchTerm, 'environment')
    );

    if (searchIdChanged || searchTermChanged) {
      this.setState(this.getQueryState(nextProps), this.fetchData);
    }

    const workBatches = nextProps.workBatches;
    const groupIds = workBatches.map(item => item.id.toString());
    if (!utils.valueIsEqual(groupIds, this.state.groupIds)) {
      this.setState({
        groupIds,
      });
    }
  },

  componentWillUnmount() {
    ProcessStore.reset();
  },

  fetchSavedSearches() {
    this.setState({
      savedSearchLoading: true,
    });

    const {orgId} = this.props.params;
    const {searchId} = this.state;

    this.api.request(`/projects/${orgId}/internal/searches/`, {
      success: data => {
        const newState = {
          isDefaultSearch: false,
          savedSearchLoading: false,
          savedSearchList: data,
          loading: false,
        };
        const needsData = this.state.loading;
        if (searchId) {
          const match = data.find(search => search.id === searchId);

          if (match) {
            newState.query = match.query;
          } else {
            this.setState(
              {
                savedSearchLoading: false,
                savedSearchList: data,
                searchId: null,
                isDefaultSearch: true,
              },
              this.transitionTo
            );
          }
        } else if (!this.hasQuery()) {
          const defaultResult =
            data.find(search => search.isUserDefault) ||
            data.find(search => search.isDefault);

          if (defaultResult) {
            newState.searchId = defaultResult.id;
            newState.query = defaultResult.query;
            newState.isDefaultSearch = true;
          }
        }

        this.setState(newState, needsData ? this.fetchData : null);
      },
      error: error => {
        // XXX(dcramer): fail gracefully by still loading the stream
        logAjaxError(error);
        this.setState({
          loading: false,
          isDefaultSearch: null,
          searchId: null,
          savedSearchList: [],
          savedSearchLoading: false,
          query: '',
        });
      },
    });
  },

  fetchProcessingIssues() {
    const {orgId} = this.props.params;
    this.api.request(`/projects/${orgId}/internal/processingissues/`, {
      success: data => {
        if (data.hasIssues || data.resolveableIssues > 0 || data.issuesProcessing > 0) {
          this.setState({
            processingIssues: data,
          });
        }
      },
      error: error => {
        logAjaxError(error);
        // this is okay. it's just a ui hint
      },
    });
  },

  showingProcessingIssues() {
    return this.state.query && this.state.query.trim() == 'is:unprocessed';
  },

  onSavedSearchCreate(data) {
    const {orgId} = this.props.params;
    const savedSearchList = this.state.savedSearchList;
    savedSearchList.push(data);
    // TODO(dcramer): sort
    this.setState({
      savedSearchList,
    });
    browserHistory.push(`/${orgId}/internal/searches/${data.id}/`);
  },

  getQueryState(props) {
    const currentQuery = props.location.query || {};

    const hasQuery = 'query' in currentQuery;

    const searchId = hasQuery
      ? null
      : props.params.searchId || this.state.searchId || null;

    const sort = 'sort' in currentQuery ? currentQuery.sort : DEFAULT_SORT;

    const statsPeriod = STATS_PERIODS.has(currentQuery.statsPeriod)
      ? currentQuery.statsPeriod
      : DEFAULT_STATS_PERIOD;

    const newState = {
      sort,
      statsPeriod,
      query: hasQuery ? currentQuery.query : '',
      searchId,
      isDefaultSearch: false,
    };

    if (searchId) {
      const searchResult = this.state.savedSearchList.find(
        search => search.id === searchId
      );
      if (searchResult) {
        newState.query = searchResult.query;

        if (this.state.searchId && !props.params.searchId) {
          newState.isDefaultSearch = true;
        }
      } else {
        newState.searchId = null;
      }
    } else if (!hasQuery) {
      const defaultResult = this.state.savedSearchList.find(search => search.isDefault);
      if (defaultResult) {
        newState.isDefaultSearch = true;
        newState.searchId = defaultResult.id;
        newState.query = defaultResult.query;
      } else {
        newState.searchId = null;
      }
    }
    newState.loading = false;
    return newState;
  },

  hasQuery(props) {
    props = props || this.props;
    const currentQuery = props.location.query || {};
    return 'query' in currentQuery;
  },

  fetchData() {
    ProcessStore.loadInitialData([]);

    this.setState({
      dataLoading: true,
      queryCount: null,
      error: false,
    });

    const url = this.getTaskGroupEndpoint();

    // Remove leading and trailing whitespace
    let query = queryString.formatQueryString(this.state.query);
    if (!query.includes(':createdAfter')) {
      query += ' ' + ':createdAfter -7d'; // always limit it unless specified
    }

    const requestParams = {
      query,
      limit: MAX_ITEMS,
      createdAfter: '-7d',
    };

    const currentQuery = this.props.location.query || {};
    if ('cursor' in currentQuery) {
      requestParams.cursor = currentQuery.cursor;
    }

    if (this.lastRequest) {
      this.lastRequest.cancel();
    }

    this.lastRequest = this.api.request(url, {
      method: 'GET',
      data: requestParams,
      success: (data, ignore, jqXHR) => {
        // if this is a direct hit, we redirect to the intended result directly.
        // we have to use the project slug from the result data instead of the
        // the current props one as the shortIdLookup can return results for
        // different projects.
        // TODO(withrocks): look into this
        if (jqXHR.getResponseHeader('X-Sentry-Direct-Hit') === '1') {
          if (data && data[0].matchingEventId) {
            const {id, matchingEventId} = data[0];
            const redirect = `/${this.props.params
              .orgId}/internal/issues/${id}/events/${matchingEventId}/`;
            return void browserHistory.push(redirect);
          }
        }

        this._processesManager.push(data);

        const queryCount = jqXHR.getResponseHeader('X-Hits');
        const queryMaxCount = jqXHR.getResponseHeader('X-Max-Hits');

        return void this.setState({
          error: false,
          dataLoading: false,
          query,
          queryCount:
            typeof queryCount !== 'undefined' ? parseInt(queryCount, 10) || 0 : 0,
          queryMaxCount:
            typeof queryMaxCount !== 'undefined' ? parseInt(queryMaxCount, 10) || 0 : 0,
          pageLinks: jqXHR.getResponseHeader('Link'),
        });
      },
      error: err => {
        let error = err.responseJSON || true;
        error = error.detail || true;
        this.setState({
          error,
          dataLoading: false,
        });
      },
      complete: jqXHR => {
        this.lastRequest = null;
      },
    });
  },

  getTaskGroupEndpoint() {
    return '/task-groups/';
  },

  onSelectStatsPeriod(period) {
    if (period != this.state.statsPeriod) {
      // TODO(dcramer): all charts should now suggest "loading"
      this.setState(
        {
          statsPeriod: period,
        },
        function() {
          this.transitionTo();
        }
      );
    }
  },

  onSearch(query) {},

  onSortChange(sort) {
    this.setState(
      {
        sort,
      },
      this.transitionTo
    );
  },

  onSidebarToggle() {
    this.setState({
      isSidebarVisible: !this.state.isSidebarVisible,
    });
  },

  /**
   * Returns true if all results in the current query are visible/on this page
   */
  allResultsVisible() {
    if (!this.state.pageLinks) {
      return false;
    }

    const links = parseLinkHeader(this.state.pageLinks);
    return links && !links.previous.results && !links.next.results;
  },

  transitionTo() {
    const queryParams = {};

    if (!this.state.searchId) {
      queryParams.query = this.state.query;
    }

    if (this.state.sort !== DEFAULT_SORT) {
      queryParams.sort = this.state.sort;
    }

    if (this.state.statsPeriod !== DEFAULT_STATS_PERIOD) {
      queryParams.statsPeriod = this.state.statsPeriod;
    }

    const params = this.props.params;

    const path = this.state.searchId
      ? `/${params.orgId}/internal/searches/${this.state.searchId}/`
      : `/${params.orgId}/internal/`;
    browserHistory.push({
      pathname: path,
      query: queryParams,
    });
  },

  renderProcessingIssuesHint() {
    const pi = this.state.processingIssues;
    if (!pi || this.showingProcessingIssues()) {
      return null;
    }

    const {orgId} = this.props.params;
    const link = `/${orgId}/internal/processing-issues/`;
    let showButton = false;
    const className = {
      'processing-issues': true,
      alert: true,
    };
    let issues = null;
    let lastEvent = null;
    let icon = null;

    if (pi.numIssues > 0) {
      icon = <span className="icon icon-alert" />;
      issues = tn(
        'There is %d issue blocking event processing',
        'There are %d issues blocking event processing',
        pi.numIssues
      );
      lastEvent = (
        <span className="last-seen">
          ({tct('last event from [ago]', {
            ago: <TimeSince date={pi.lastSeen} />,
          })})
        </span>
      );
      className['alert-error'] = true;
      showButton = true;
    } else if (pi.issuesProcessing > 0) {
      icon = <span className="icon icon-processing play" />;
      className['alert-info'] = true;
      issues = tn(
        'Reprocessing %d event …',
        'Reprocessing %d events …',
        pi.issuesProcessing
      );
    } else if (pi.resolveableIssues > 0) {
      icon = <span className="icon icon-processing" />;
      className['alert-warning'] = true;
      issues = tn(
        'There is %d event pending reprocessing.',
        'There are %d events pending reprocessing.',
        pi.resolveableIssues
      );
      showButton = true;
    } else {
      /* we should not go here but what do we know */ return null;
    }
    return (
      <div
        className={classNames(className)}
        style={{margin: '-1px -1px 0', padding: '10px 16px'}}
      >
        {showButton && (
          <Link to={link} className="btn btn-default btn-sm pull-right">
            {t('Show details')}
          </Link>
        )}
        {icon} <strong>{issues}</strong> {lastEvent}{' '}
      </div>
    );
  },

  renderGroupNodes(ids, statsPeriod) {
    const {workBatches, toggleWorkBatchSelect} = this.props;

    // Restrict this guide to only show for new users (joined<30 days) and add guide anhor only to the first issue
    const userDateJoined = new Date(ConfigStore.get('user').dateJoined);
    const dateCutoff = new Date();
    dateCutoff.setDate(dateCutoff.getDate() - 30);

    const topIssue = ids[0];

    const {orgId} = this.props.params;
    const groupNodes = ids.map(id => {
      const workBatch = workBatches.find(ut => ut.id == id);
      const hasGuideAnchor = userDateJoined > dateCutoff && id === topIssue;
      const title = workBatch.name;
      const culprit = title;
      const filename = workBatch.handler;
      const metadata = {value: title, filename};
      const type = 'default'; // ["error","csp","hpkp","expectct","expectstaple","default"]
      const count = 1;
      const userCount = 1;
      const stats = {'24h': [[0, 10], [1, 20], [3, 35]]};
      const level = Math.floor(Math.random() * Math.floor(2)).toString();
      const eventID = null;
      const numComments = workBatch.num_comments;
      const lastSeen = null; //'2019-06-02';
      const firstSeen = workBatch.created;
      const subscriptionDetails = {reason: 'Just cause'};
      const annotations = ['an annotation'];
      const assignedTo = {name: 'admin@localhost'};
      const showAssignee = true;
      const shortId = 'shortid';
      const data = {
        id,
        metadata,
        type,
        count,
        userCount,
        stats,
        title,
        level,
        culprit,
        eventID,
        numComments,
        lastSeen,
        firstSeen,
        subscriptionDetails,
        annotations,
        assignedTo,
        showAssignee,
        shortId,
      };

      const toggleSelect = () => {
        toggleWorkBatchSelect(id);
      };

      return (
        <WorkBatchListItem
          workBatch={workBatch}
          toggleWorkBatchSelect={toggleSelect.bind(this)}
          isSelected={workBatch.selected}
          data={data}
          key={id}
          id={id}
          orgId={orgId}
          statsPeriod={statsPeriod}
          query={this.state.query}
          hasGuideAnchor={hasGuideAnchor}
        />
      );
    });
    return <PanelBody className="ref-group-list">{groupNodes}</PanelBody>;
  },

  renderNoTasksFound() {
    // TODO: Render a pretty "nothing found" message
    return <div />;
  },

  renderEmpty() {
    const message = t('Sorry, no events match your filters.');

    // TODO(lyn): Extract empty state to a separate component
    return (
      <div className="empty-stream" style={{border: 0}}>
        <span className="icon icon-exclamation" />
        <p>{message}</p>
      </div>
    );
  },

  renderLoading() {
    return <LoadingIndicator />;
  },

  renderProcessesBody() {
    let body;
    if (this.state.dataLoading) {
      body = this.renderLoading();
    } else if (this.state.error) {
      body = <LoadingError message={this.state.error} onRetry={this.fetchData} />;
    } else if (this.state.groupIds.length > 0) {
      body = this.renderGroupNodes(this.state.groupIds, this.state.statsPeriod);
    } else {
      body = this.renderEmpty();
    }
    return body;
  },

  render() {
    // global loading
    if (this.state.loading) {
      return this.renderLoading();
    }
    const params = this.props.params;
    const classes = ['stream-row'];
    if (this.state.isSidebarVisible) {
      classes.push('show-sidebar');
    }
    const {orgId} = this.props.params;
    const searchId = this.state.searchId;
    const access = this.getAccess();
    return (
      <div className={classNames(classes)}>
        <div className="stream-content">
          <StreamFilters
            access={access}
            orgId={orgId}
            query={this.state.query}
            sort={this.state.sort}
            searchId={searchId}
            queryCount={this.state.queryCount}
            queryMaxCount={this.state.queryMaxCount}
            onSortChange={this.onSortChange}
            onSearch={this.onSearch}
            onSavedSearchCreate={this.onSavedSearchCreate}
            onSidebarToggle={this.onSidebarToggle}
            isSearchDisabled={this.state.isSidebarVisible}
            savedSearchList={this.state.savedSearchList}
          />
          <Panel>
            <WorkBatchListActions
              orgId={params.orgId}
              hasReleases={true}
              query={this.state.query}
              queryCount={this.state.queryCount}
              onSelectStatsPeriod={this.onSelectStatsPeriod}
              statsPeriod={this.state.statsPeriod}
              groupIds={this.state.groupIds}
              allResultsVisible={this.allResultsVisible()}
            />
            <PanelBody>
              {this.renderProcessingIssuesHint()}
              {this.renderProcessesBody()}
            </PanelBody>
          </Panel>
          <Pagination pageLinks={this.state.pageLinks} />
        </div>
        <StreamSidebar
          loading={this.props.tagsLoading}
          tags={this.props.tags}
          query={this.state.query}
          onQueryChange={this.onSearch}
          orgId={params.orgId}
          projectId="internal"
        />
      </div>
    );
  },
});

const mapStateToProps = state => state.workBatch;

const mapDispatchToProps = dispatch => ({
  getWorkBatches: () => dispatch(workBatchesGet()),
  toggleWorkBatchSelect: id => dispatch(workBatchToggleSelect(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(WorkBatches);
