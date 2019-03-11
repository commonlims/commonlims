import React from 'react';
import createReactClass from 'create-react-class';

import SentryTypes from 'app/sentryTypes';
import withEnvironmentInQueryString from 'app/utils/withEnvironmentInQueryString';
import Samples from 'app/views/samples/samples';
import {fetchTags} from 'app/actionCreators/tags';

const SamplesContainer = createReactClass({
  displayName: 'SamplesContainer',
  propTypes: {
    environment: SentryTypes.Environment,
  },

  componentWillMount() {
    const {orgId} = this.props.params;
    fetchTags(orgId);
  },

  render() {
    return <Samples {...this.props} />;
  },
});

export default withEnvironmentInQueryString(SamplesContainer);
