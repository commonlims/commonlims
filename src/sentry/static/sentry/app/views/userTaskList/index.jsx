import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import createReactClass from 'create-react-class';
import {omit} from 'lodash';

import SentryTypes from 'app/sentryTypes';
import ProcessTagStore from 'app/stores/processTagStore';
import withEnvironmentInQueryString from 'app/utils/withEnvironmentInQueryString';
import Processes from 'app/views/userTaskList/processes';
import ProjectState from 'app/mixins/projectState';
import TagStore from 'app/stores/tagStore';
import {fetchTags} from 'app/actionCreators/tags';

const ProcessesContainer = createReactClass({
  displayName: 'ProcessesContainer',
  propTypes: {
    environment: SentryTypes.Environment,
    setProjectNavSection: PropTypes.func,
  },

  mixins: [ProjectState, Reflux.listenTo(TagStore, 'onTagsChange')],

  getInitialState() {
    return {
      tags: ProcessTagStore.getAllTags(),
      tagsLoading: true,
    };
  },

  componentWillMount() {
    const {orgId, projectId} = this.props.params;
    // this.props.setProjectNavSection('stream');
    fetchTags(orgId, projectId);
  },

  // We don't want the environment tag to be visible to the user
  filterTags(tags) {
    return omit(tags, 'environment');
  },

  onTagsChange(tags) {
    this.setState({
      tags,
      tagsLoading: false,
    });
  },

  render() {
    const {hasEnvironmentsFeature, tags} = this.state;
    const filteredTags = hasEnvironmentsFeature ? this.filterTags(this.state.tags) : tags;

    // TODO: read tagsLoading from state instead
    return (
      <Processes
        hasEnvironmentsFeature={hasEnvironmentsFeature}
        tags={filteredTags}
        tagsLoading={false}
        {...this.props}
      />
    );
  },
});

export default withEnvironmentInQueryString(ProcessesContainer);
