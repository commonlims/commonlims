import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import styled from 'react-emotion';

import {analytics} from 'app/utils/analytics';
import Alert from 'app/components/alert';
import ConfigStore from 'app/stores/configStore';
import {t} from 'app/locale';

const InstallPromptBanner = createReactClass({
  displayName: 'installPromptBanner',
  propTypes: {
    organization: PropTypes.object,
  },

  mixins: [Reflux.listenTo(ConfigStore, 'onConfigStoreUpdate')],

  getInitialState() {
    return {
      sentFirstEvent: this.sentFirstEvent(),
    };
  },

  componentDidMount() {
    const {href} = window.location;
    const {organization} = this.props;
    analytics('install_prompt.banner_viewed', {
      org_id: parseInt(organization.id, 10),
      page: href,
    });
  },

  onConfigStoreUpdate(config) {
    if (!this.state.sentFirstEvent && config.sentFirstEvent) {
      this.setState({sentFirstEvent: true});
    }
  },

  sentFirstEvent() {
    const {projects} = this.props.organization;
    return !!projects.find(project => project.firstEvent);
  },

  recordAnalytics() {
    const {href} = window.location;
    const {organization} = this.props;
    analytics('install_prompt.banner_clicked', {
      org_id: parseInt(organization.id, 10),
      page: href,
    });
  },

  inSetupFlow() {
    const path = window.location.pathname;

    return (
      path.indexOf('/getting-started/') !== -1 ||
      path.indexOf('/onboarding/') !== -1 ||
      path.indexOf('/projects/new/') !== -1
    );
  },

  render() {
    const {sentFirstEvent} = this.state;
    const hideBanner = sentFirstEvent || this.inSetupFlow();

    return (
      <React.Fragment>
        {!hideBanner && (
          <StyledAlert type="warning" icon="icon-circle-exclamation" system="system">
            <div>{t('Welcome to Common LIMS.')}</div>
          </StyledAlert>
        )}
      </React.Fragment>
    );
  },
});

const StyledAlert = styled(Alert)`
  padding: ${p => p.theme.grid}px ${p => p.theme.grid * 2}px;
  position: relative;
  margin: 0;
  padding-right: ${p => p.theme.grid * 4}px;
  a {
    color: #2f2936;
    border-bottom: 1px dotted black;
  }
  use {
    color: black;
  }
`;

export default InstallPromptBanner;
