import React from 'react';
import createReactClass from 'create-react-class';
import {omit} from 'lodash';

import SentryTypes from 'app/sentryTypes';
import ProcessTagStore from 'app/stores/processTagStore';
import withEnvironmentInQueryString from 'app/utils/withEnvironmentInQueryString';
import Processes from 'app/views/userTaskList/processes';

const ProcessesContainer = createReactClass({
  displayName: 'ProcessesContainer',
  propTypes: {
    environment: SentryTypes.Environment,
  },

  getInitialState() {
    return {
      tags: ProcessTagStore.getAllTags(),
      tagsLoading: true,
    };
  },

  // We don't want the environment tag to be visible to the user
  filterTags(tags) {
    return omit(tags, 'environment');
  },

  render() {
    const {hasEnvironmentsFeature, tagsLoading, tags} = this.state;
    const filteredTags = hasEnvironmentsFeature ? this.filterTags(this.state.tags) : tags;

    return (
      <Processes
        hasEnvironmentsFeature={hasEnvironmentsFeature}
        tags={filteredTags}
        tagsLoading={tagsLoading}
        {...this.props}
      />
    );
  },
});

export default withEnvironmentInQueryString(ProcessesContainer);
