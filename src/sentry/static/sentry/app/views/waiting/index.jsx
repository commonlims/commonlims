import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import createReactClass from 'create-react-class';
import {omit} from 'lodash';

import SentryTypes from 'app/sentryTypes';
import ProjectState from 'app/mixins/projectState';
import TagStore from 'app/stores/tagStore';
import withEnvironmentInQueryString from 'app/utils/withEnvironmentInQueryString';
import WaitingSamples from 'app/views/waiting/samples';
import {fetchTags} from 'app/actionCreators/tags';

const WaitingContainer = createReactClass({
  displayName: 'WaitingContainer',
  propTypes: {
    environment: SentryTypes.Environment,
    setProjectNavSection: PropTypes.func,
  },

  mixins: [ProjectState, Reflux.listenTo(TagStore, 'onTagsChange')],

  getInitialState() {
    const hasEnvironmentsFeature = new Set(this.getOrganization().features).has(
      'environments'
    );

    return {
      tags: TagStore.getAllTags(),
      tagsLoading: true,
      hasEnvironmentsFeature,
    };
  },

  componentWillMount() {
    const {orgId, projectId} = this.props.params;
    this.props.setProjectNavSection('waiting');
    fetchTags(orgId, projectId);
  },

  onTagsChange(tags) {
    this.setState({
      tags,
      tagsLoading: false,
    });
  },

  // We don't want the environment tag to be visible to the user
  filterTags(tags) {
    return omit(tags, 'environment');
  },

  render() {
    const {hasEnvironmentsFeature, tagsLoading, tags} = this.state;
    const filteredTags = hasEnvironmentsFeature ? this.filterTags(this.state.tags) : tags;

    return (
      <WaitingSamples
        hasEnvironmentsFeature={hasEnvironmentsFeature}
        tags={filteredTags}
        tagsLoading={tagsLoading}
        {...this.props}
      />
    );
  },
});

export default withEnvironmentInQueryString(WaitingContainer);
