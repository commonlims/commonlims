import {Link, browserHistory} from 'react-router';
import {omit, isEqual} from 'lodash';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import classNames from 'classnames';
import createReactClass from 'create-react-class';
import qs from 'query-string';

import {Panel, PanelBody} from 'app/components/panels';
import {logAjaxError} from 'app/utils/logging';
import {
  setActiveEnvironment,
  setActiveEnvironmentName,
} from 'app/actionCreators/environments';
import {t, tn, tct} from 'app/locale';
import ApiMixin from 'app/mixins/apiMixin';
import ConfigStore from 'app/stores/configStore';
import EnvironmentStore from 'app/stores/environmentStore';
import ErrorRobot from 'app/components/errorRobot';
//import WaitingStore from 'app/stores/waitingStore';
import SampleStore from 'app/stores/sampleStore';
import LoadingError from 'app/components/loadingError';
import LoadingIndicator from 'app/components/loadingIndicator';
import Pagination from 'app/components/pagination';
import ProjectState from 'app/mixins/projectState';
import SentryTypes from 'app/sentryTypes';
import SamplesActions from 'app/views/samples/actions';
import SamplesFilters from 'app/views/samples/filters';
import SamplesGroup from 'app/components/samples/sample';
import SamplesSidebar from 'app/views/samples/sidebar';
import TimeSince from 'app/components/timeSince';
import parseLinkHeader from 'app/utils/parseLinkHeader';
import queryString from 'app/utils/queryString';
import utils from 'app/utils';

const MAX_ITEMS = 25;
const DEFAULT_SORT = 'date';
const DEFAULT_STATS_PERIOD = '24h';
const STATS_PERIODS = new Set(['14d', '24h']);

const Samples = createReactClass({
  // This class was based on the Stream class in Sentry

  displayName: 'Samples',

  propTypes: {
    environment: SentryTypes.Environment,
    hasEnvironmentsFeature: PropTypes.bool,
    tags: PropTypes.object,
    tagsLoading: PropTypes.bool,
  },

  mixins: [Reflux.listenTo(SampleStore, 'onSampleChange'), ApiMixin, ProjectState],

  getInitialState() {
    let searchId = this.props.params.searchId || null;
    let project = this.getProject();
    let realtimeActiveCookie = Cookies.get('realtimeActive');
    let realtimeActive =
      typeof realtimeActiveCookie === 'undefined'
        ? project && !project.firstEvent
        : realtimeActiveCookie === 'true';

    let currentQuery = this.props.location.query || {};
    let sort = 'sort' in currentQuery ? currentQuery.sort : DEFAULT_SORT;

    let hasQuery = 'query' in currentQuery;
    let statsPeriod = STATS_PERIODS.has(currentQuery.statsPeriod)
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
      realtimeActive,
      pageLinks: '',
      queryCount: null,
      dataLoading: true,
      error: false,
      query: hasQuery ? currentQuery.query : '',
      sort,
      isSidebarVisible: false,
      processingIssues: null,
      environment: this.props.environment,
    };
  },

  componentWillMount() {
    this._samplesManager = new utils.SamplesManager(SampleStore);
    this._poller = new utils.CursorPoller({
      success: this.onRealtimePoll,
    });

    this.fetchSavedSearches();
    this.fetchProcessingIssues();
    if (!this.state.loading) {
      this.fetchData();
    }
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.environment !== this.props.environment) {
      this.setState(
        {
          environment: nextProps.environment,
        },
        this.fetchData
      );
    }

    // you cannot apply both a query and a saved search (our routes do not
    // support it), so the searchId takes priority
    let nextSearchId = nextProps.params.searchId || null;

    let searchIdChanged = this.state.isDefaultSearch
      ? nextSearchId !== null
      : nextSearchId !== this.state.searchId;

    // We are using qs.parse with location.search since this.props.location.query
    // returns the same value as nextProps.location.query
    let currentSearchTerm = qs.parse(this.props.location.search);
    let nextSearchTerm = qs.parse(nextProps.location.search);

    let searchTermChanged = !isEqual(
      omit(currentSearchTerm, 'environment'),
      omit(nextSearchTerm, 'environment')
    );

    if (searchIdChanged || searchTermChanged) {
      this.setState(this.getQueryState(nextProps), this.fetchData);
    }
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState.realtimeActive !== this.state.realtimeActive) {
      // User toggled realtime button
      if (this.state.realtimeActive) {
        this.resumePolling();
      } else {
        this._poller.disable();
      }
    }
  },

  componentWillUnmount() {
    this._poller.disable();
    SampleStore.reset();
  },

  fetchSavedSearches() {
    this.setState({
      savedSearchLoading: true,
    });

    const {orgId, projectId} = this.props.params;
    const {searchId} = this.state;

    // TODO: searches should be on organization level
    this.api.request(`/projects/${orgId}/${projectId}/searches/`, {
      success: data => {
        const newState = {
          isDefaultSearch: false,
          savedSearchLoading: false,
          savedSearchList: data,
          loading: false,
        };
        let needsData = this.state.loading;
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
            // Check if there is an environment specified in the default search
            const envName = queryString.getQueryEnvironment(defaultResult.query);
            const env = EnvironmentStore.getByName(envName);
            if (env) {
              setActiveEnvironment(env);
            }

            newState.searchId = defaultResult.id;

            if (this.getFeatures().has('environments')) {
              newState.query = queryString.getQueryStringWithoutEnvironment(
                defaultResult.query
              );
            } else {
              newState.query = defaultResult.query;
            }
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
    let {orgId, projectId} = this.props.params;
    this.api.request(`/projects/${orgId}/${projectId}/processingissues/`, {
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
    let {orgId, projectId} = this.props.params;
    let savedSearchList = this.state.savedSearchList;
    savedSearchList.push(data);
    // TODO(dcramer): sort
    this.setState({
      savedSearchList,
    });
    browserHistory.push(`/${orgId}/${projectId}/searches/${data.id}/`);
  },

  getQueryState(props) {
    let currentQuery = props.location.query || {};

    let hasQuery = 'query' in currentQuery;

    let searchId = hasQuery ? null : props.params.searchId || this.state.searchId || null;

    let sort = 'sort' in currentQuery ? currentQuery.sort : DEFAULT_SORT;

    let statsPeriod = STATS_PERIODS.has(currentQuery.statsPeriod)
      ? currentQuery.statsPeriod
      : DEFAULT_STATS_PERIOD;

    let newState = {
      sort,
      statsPeriod,
      query: hasQuery ? currentQuery.query : '',
      searchId,
      isDefaultSearch: false,
    };

    if (searchId) {
      let searchResult = this.state.savedSearchList.find(
        search => search.id === searchId
      );
      if (searchResult) {
        // New behavior is that we'll no longer want to support environment in saved search
        // We check if the query contains a valid environment and update the global setting if so
        // We'll always strip environment from the querystring whether valid or not
        if (this.props.hasEnvironmentsFeature) {
          const queryEnv = queryString.getQueryEnvironment(searchResult.query);
          if (queryEnv) {
            const env = EnvironmentStore.getByName(queryEnv);
            setActiveEnvironment(env);
          }
          newState.query = queryString.getQueryStringWithoutEnvironment(
            searchResult.query
          );
        } else {
          // Old behavior, keep the environment in the querystring
          newState.query = searchResult.query;
        }

        if (this.state.searchId && !props.params.searchId) {
          newState.isDefaultSearch = true;
        }
      } else {
        newState.searchId = null;
      }
    } else if (!hasQuery) {
      let defaultResult = this.state.savedSearchList.find(search => search.isDefault);
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
    let currentQuery = props.location.query || {};
    return 'query' in currentQuery;
  },

  fetchData() {
    SampleStore.loadInitialData([]);

    this.setState({
      dataLoading: true,
      queryCount: null,
      error: false,
    });

    let url = this.getGroupListEndpoint();
    console.log('here: Getting sample sample endpoint (RENAME)', url);

    // Remove leading and trailing whitespace
    let query = queryString.formatQueryString(this.state.query);
    console.log('query', url);

    let {environment} = this.state;

    let requestParams = {
      query,
      limit: MAX_ITEMS,
      sort: this.state.sort,
      statsPeriod: this.state.statsPeriod,
      shortIdLookup: '1',
    };

    // Always keep the global active environment in sync with the queried environment
    // The global environment wins unless there one is specified by the saved search
    const queryEnvironment = queryString.getQueryEnvironment(query);

    if (queryEnvironment !== null) {
      requestParams.environment = queryEnvironment;
    } else if (environment) {
      requestParams.environment = environment.name;
    }

    let currentQuery = this.props.location.query || {};
    if ('cursor' in currentQuery) {
      requestParams.cursor = currentQuery.cursor;
    }

    if (this.lastRequest) {
      this.lastRequest.cancel();
    }

    this._poller.disable();

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
            let {project, id, matchingEventId, matchingEventEnvironment} = data[0];
            let redirect = `/${this.props.params
              .orgId}/${project.slug}/issues/${id}/events/${matchingEventId}/`;
            // Also direct to the environment of this specific event if this
            // key exists. We need to explicitly check against undefined becasue
            // an environment name may be an empty string, which is perfectly valid.
            if (typeof matchingEventEnvironment !== 'undefined') {
              setActiveEnvironmentName(matchingEventEnvironment);
              redirect = `${redirect}?${qs.stringify({
                environment: matchingEventEnvironment,
              })}`;
            }
            return void browserHistory.push(redirect);
          }
        }

        data = [
          {
            numComments: 16,
            userCount: 1,
            culprit: 'hello_world',
            title: 'asdfjksafdjkafds',
            name: 'RC-0123-Hund-1',
            container: 'RC-0123-Hund',
            position: 'A:1',
            id: '5',
            assignedTo: null,
            logger: null,
            type: 'error',
            annotations: [],
            metadata: {
              type: 'Exception 2',
              value: 'will this happen?',
            },
            status: 'unresolved',
            subscriptionDetails: null,
            isPublic: true,
            hasSeen: true,
            shortId: 'RC-0123-4',
            shareId: 'd7da866462cb4894a56b57abd85ca1fd',
            firstSeen: '2018-10-14T22:05:12Z',
            count: '6',
            permalink: 'sentry/rc-0123/issues/5/',
            level: 'error',
            isSubscribed: true,
            isBookmarked: false,
            project: {
              slug: 'rc-0123',
              id: '2',
              name: 'RC-0123',
            },
            statusDetails: {},
          },
          {
            lastSeen: '2018-10-14T22:01:47Z',
            numComments: 0,
            userCount: 0,
            culprit: '__main__ in <module>',
            title: "NameError: name 'Flask' is not defined",
            name: 'RC-0123-Hund-2',
            container: 'RC-0123-Hund',
            position: 'A:1',
            id: '3',
            assignedTo: null,
            logger: null,
            type: 'error',
            annotations: [],
            metadata: {
              type: 'NameError',
              value: "name 'Flask' is not defined",
            },
            status: 'unresolved',
            subscriptionDetails: null,
            isPublic: false,
            hasSeen: true,
            shortId: 'RC-0123-2',
            shareId: null,
            firstSeen: '2018-10-14T22:01:39Z',
            count: '2',
            permalink: 'sentry/rc-0123/issues/3/',
            level: 'error',
            isSubscribed: true,
            isBookmarked: false,
            project: {
              slug: 'rc-0123',
              id: '2',
              name: 'RC-0123',
            },
            statusDetails: {},
          },
          {
            lastSeen: '2018-10-11T11:43:30Z',
            numComments: 3,
            userCount: 0,
            culprit: 'poll(../../sentry/scripts/views.js)',
            title: "TypeError: Object [object Object] has no method 'updateFrom'",
            name: 'RC-0123-Hund-3',
            container: 'RC-0123-Hund',
            position: 'B:1',
            id: '2',
            assignedTo: null,
            logger: null,
            type: 'error',
            annotations: [],
            metadata: {
              type: 'TypeError',
              value: "Object [object Object] has no method 'updateFrom'",
            },
            status: 'unresolved',
            subscriptionDetails: {
              reason: 'mentioned',
            },
            isPublic: false,
            hasSeen: true,
            shortId: 'RC-0123-1',
            shareId: null,
            firstSeen: '2018-10-11T11:43:30Z',
            count: '1',
            permalink: 'sentry/rc-0123/issues/2/',
            level: 'error',
            isSubscribed: true,
            isBookmarked: false,
            project: {
              slug: 'rc-0123',
              id: '2',
              name: 'RC-0123',
            },
            statusDetails: {},
          },
        ];

        this._samplesManager.push(data);

        let queryCount = jqXHR.getResponseHeader('X-Hits');
        let queryMaxCount = jqXHR.getResponseHeader('X-Max-Hits');

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

        this.resumePolling();
      },
    });
  },

  resumePolling() {
    if (!this.state.pageLinks) return;

    // Only resume polling if we're on the first page of results
    let links = parseLinkHeader(this.state.pageLinks);
    if (links && !links.previous.results && this.state.realtimeActive) {
      this._poller.setEndpoint(links.previous.href);
      this._poller.enable();
    }
  },

  getGroupListEndpoint() {
    let params = this.props.params;

    return '/projects/' + params.orgId + '/' + params.projectId + '/issues/';
  },

  onRealtimeChange(realtime) {
    Cookies.set('realtimeActive', realtime.toString());
    this.setState({
      realtimeActive: realtime,
    });
  },

  onRealtimePoll(data, links) {
    this._samplesManager.unshift(data);
    if (!utils.valueIsEqual(this.state.pageLinks, links, true)) {
      this.setState({
        pageLinks: links,
      });
    }
  },

  onSampleChange() {
    let groupIds = this._samplesManager.getAllItems().map(item => item.id);
    if (!utils.valueIsEqual(groupIds, this.state.groupIds)) {
      this.setState({
        groupIds,
      });
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
    if (!this.state.pageLinks) return false;

    let links = parseLinkHeader(this.state.pageLinks);
    return links && !links.previous.results && !links.next.results;
  },

  transitionTo() {
    let queryParams = {};

    if (this.props.location.query.environment) {
      queryParams.environment = this.props.location.query.environment;
    }

    if (!this.state.searchId) {
      queryParams.query = this.state.query;
    }

    if (this.state.sort !== DEFAULT_SORT) {
      queryParams.sort = this.state.sort;
    }

    if (this.state.statsPeriod !== DEFAULT_STATS_PERIOD) {
      queryParams.statsPeriod = this.state.statsPeriod;
    }

    let params = this.props.params;

    let path = this.state.searchId
      ? `/${params.orgId}/${params.projectId}/searches/${this.state.searchId}/`
      : `/${params.orgId}/${params.projectId}/`;
    browserHistory.push({
      pathname: path,
      query: queryParams,
    });
  },

  renderProcessingIssuesHint() {
    let pi = this.state.processingIssues;
    if (!pi || this.showingProcessingIssues()) {
      return null;
    }

    let {orgId, projectId} = this.props.params;
    let link = `/${orgId}/${projectId}/settings/processing-issues/`;
    let showButton = false;
    let className = {
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
    // Restrict this guide to only show for new users (joined<30 days) and add guide anhor only to the first issue
    let userDateJoined = new Date(ConfigStore.get('user').dateJoined);
    let dateCutoff = new Date();
    dateCutoff.setDate(dateCutoff.getDate() - 30);

    let topIssue = ids[0];

    let {orgId, projectId} = this.props.params;
    let groupNodes = ids.map(id => {
      let hasGuideAnchor = userDateJoined > dateCutoff && id === topIssue;
      return (
        <SamplesGroup
          key={id}
          id={id}
          orgId={orgId}
          projectId={projectId}
          statsPeriod={statsPeriod}
          query={this.state.query}
          hasGuideAnchor={hasGuideAnchor}
        />
      );
    });
    return <PanelBody className="ref-group-list">{groupNodes}</PanelBody>;
  },

  renderAwaitingEvents() {
    let org = this.getOrganization();
    let project = this.getProject();
    let sampleIssueId = this.state.groupIds.length > 0 ? this.state.groupIds[0] : '';
    return (
      <ErrorRobot
        org={org}
        project={project}
        sampleIssueId={sampleIssueId}
        gradient={true}
      />
    );
  },

  renderEmpty() {
    const {environment} = this.state;
    const message = environment
      ? tct('Sorry no events match your filters in the [env] environment.', {
          env: environment.displayName,
        })
      : t('Sorry, no events match your filters.');

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

  renderSamplesBody() {
    let body;
    let project = this.getProject();
    if (this.state.dataLoading) {
      body = this.renderLoading();
    } else if (this.state.error) {
      body = <LoadingError message={this.state.error} onRetry={this.fetchData} />;
    } else if (!project.firstEvent) {
      body = this.renderAwaitingEvents();
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
    let params = this.props.params;
    let classes = ['stream-row'];
    if (this.state.isSidebarVisible) classes.push('show-sidebar');
    let {orgId, projectId} = this.props.params;
    let searchId = this.state.searchId;
    let access = this.getAccess();
    let projectFeatures = this.getProjectFeatures();
    return (
      <div className={classNames(classes)}>
        <div className="stream-content">
          <SamplesFilters
            access={access}
            orgId={orgId}
            projectId={projectId}
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
            <SamplesActions
              orgId={params.orgId}
              projectId={params.projectId}
              hasReleases={projectFeatures.has('releases')}
              latestRelease={this.context.project.latestRelease}
              environment={this.state.environment}
              query={this.state.query}
              queryCount={this.state.queryCount}
              onRealtimeChange={this.onRealtimeChange}
              realtimeActive={this.state.realtimeActive}
              statsPeriod={this.state.statsPeriod}
              groupIds={this.state.groupIds}
              allResultsVisible={this.allResultsVisible()}
            />
            <PanelBody>
              {this.renderProcessingIssuesHint()}
              {this.renderSamplesBody()}
            </PanelBody>
          </Panel>
          <Pagination pageLinks={this.state.pageLinks} />
        </div>
        <SamplesSidebar
          loading={this.props.tagsLoading}
          tags={this.props.tags}
          query={this.state.query}
          onQueryChange={this.onSearch}
          orgId={params.orgId}
          projectId={params.projectId}
        />
      </div>
    );
  },
});
export default Samples;
