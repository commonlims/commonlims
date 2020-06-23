import {withRouter} from 'react-router';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import createReactClass from 'create-react-class';

import {t} from 'app/locale';
import ApiMixin from 'app/mixins/apiMixin';
import LoadingError from 'app/components/loadingError';
import LoadingIndicator from 'app/components/loadingIndicator';
import MemberListStore from 'app/stores/memberListStore';
import MissingProjectMembership from 'app/components/missingProjectMembership';
import OrganizationState from 'app/mixins/organizationState';
import ProjectsStore from 'app/stores/projectsStore';
import SentryTypes from 'app/sentryTypes';
import withProjects from 'app/utils/withProjects';

const ERROR_TYPES = {
  MISSING_MEMBERSHIP: 'MISSING_MEMBERSHIP',
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Higher-order component that sets `project` as a child context
 * value to be accessed by child elements.
 *
 * Additionally delays rendering of children until project XHR has finished
 * and context is populated.
   CLIMS: not project dependent, but since it's currently gluing things together
 */
const OrganizationInnerContext = createReactClass({
  displayName: 'OrganizationInnerContext',

  propTypes: {
    /**
     * If true, this will not change `state.loading` during `fetchData` phase
     */
    skipReload: PropTypes.bool,
    projects: PropTypes.arrayOf(SentryTypes.Project),
    projectId: PropTypes.string,
    orgId: PropTypes.string,
  },

  childContextTypes: {
    project: SentryTypes.Project,
  },

  mixins: [
    ApiMixin,
    Reflux.connect(MemberListStore, 'memberList'),
    Reflux.listenTo(ProjectsStore, 'onProjectChange'),
    OrganizationState,
  ],

  getInitialState() {
    return {
      loading: true,
      error: false,
      errorType: null,
      memberList: [],
      project: null,
      projectNavSection: null,
    };
  },

  getChildContext() {
    return {
      project: this.state.project,
    };
  },

  UNSAFE_componentWillMount() {
    this.fetchData();
  },

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.projectId === this.props.projectId) {
      return;
    }

    if (!nextProps.skipReload) {
      this.remountComponent();
    }
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.projectId !== this.props.projectId) {
      this.fetchData();
    }

    // Call forceUpdate() on <DocumentTitle/> if either project or organization
    // state has changed. This is because <DocumentTitle/>'s shouldComponentUpdate()
    // returns false unless props differ; meaning context changes for project/org
    // do NOT trigger renders for <DocumentTitle/> OR any subchildren. The end result
    // being that child elements that listen for context changes on project/org will
    // NOT update (without this hack).
    // See: https://github.com/gaearon/react-document-title/issues/35

    // intentionally shallow comparing references
    if (
      prevState.project !== this.state.project ||
      prevState.organization !== this.state.organization
    ) {
      if (!this.docTitle) {
        return;
      }
      const docTitle = this.docTitleRef.docTitle;
      if (docTitle) {
        docTitle.forceUpdate();
      }
    }
  },

  remountComponent() {
    this.setState(this.getInitialState());
  },

  getTitle() {
    if (this.state.project) {
      return this.state.project.slug;
    }
    return 'Sentry';
  },

  onProjectChange(projectIds) {
    if (!this.state.project) {
      return;
    }
    if (!projectIds.has(this.state.project.id)) {
      return;
    }

    this.setState({
      project: {...ProjectsStore.getById(this.state.project.id)},
    });
  },

  identifyProject() {
    const {projects, projectId} = this.props;
    const projectSlug = projectId;
    return projects.find(({slug}) => slug === projectSlug) || null;
  },

  fetchData() {
    this.setState({
      loading: false,
      error: false,
      errorType: ERROR_TYPES.UNKNOWN,
    });
  },

  getEnvironmentListEndpoint() {
    const {orgId, projectId} = this.props;
    return `/projects/${orgId}/${projectId}/environments/`;
  },

  getMemberListEndpoint() {
    const {orgId, projectId} = this.props;
    return `/projects/${orgId}/${projectId}/members/`;
  },

  setProjectNavSection(section) {
    this.setState({
      projectNavSection: section,
    });
  },

  renderBody() {
    if (this.state.loading) {
      return (
        <div className="loading-full-layout">
          <LoadingIndicator />
        </div>
      );
    } else if (this.state.error) {
      switch (this.state.errorType) {
        case ERROR_TYPES.PROJECT_NOT_FOUND:
          // TODO(chrissy): use scale for margin values
          return (
            <div className="container">
              <div className="alert alert-block" style={{margin: '30px 0 10px'}}>
                {t('The project you were looking for was not found.')}
              </div>
            </div>
          );
        case ERROR_TYPES.MISSING_MEMBERSHIP:
          // TODO(dcramer): add various controls to improve this flow and break it
          // out into a reusable missing access error component
          return (
            <MissingProjectMembership
              organization={this.getOrganization()}
              projectId={this.state.project.slug}
            />
          );
        default:
          return <LoadingError onRetry={this.remountComponent} />;
      }
    }
    return this.props.children;
  },

  render() {
    return (
      <DocumentTitle ref={(ref) => (this.docTitleRef = ref)} title={this.getTitle()}>
        {this.renderBody()}
      </DocumentTitle>
    );
  },
});

export {OrganizationInnerContext};

export default withProjects(withRouter(OrganizationInnerContext));
