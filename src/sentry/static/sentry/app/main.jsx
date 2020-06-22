/* global module */
import {hot} from 'react-hot-loader';
import React from 'react';
import {Router, browserHistory} from 'react-router';

import routes from 'app/routes';
import {loadPreferencesState} from 'app/actionCreators/preferences';
import {cache} from 'emotion';
import {CacheProvider} from '@emotion/core';

class Main extends React.Component {
  componentDidMount() {
    loadPreferencesState();
  }

  render() {
    // This step is necessary if you still use css, keyframes or injectGlobal from emotion.
    // Once you remove all the usages of them in your app, you can remove this.
    return (
      <CacheProvider value={cache}>
        <Router history={browserHistory}>{routes()}</Router>;
      </CacheProvider>
    );
  }
}

export default hot(module)(Main);
