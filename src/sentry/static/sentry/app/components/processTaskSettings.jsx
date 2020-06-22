import {Flex} from 'reflexbox';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';

import {t} from 'app/locale';
import ApiMixin from 'app/mixins/apiMixin';
import IndicatorStore from 'app/stores/indicatorStore';
import LoadingIndicator from 'app/components/loadingIndicator';
import {Panel, PanelBody, PanelHeader} from 'app/components/panels';
import {GenericField} from 'app/components/forms';

const ProcessTaskSettings = createReactClass({
  displayName: 'ProcessTaskSettings',

  propTypes: {
    onChanged: PropTypes.func.isRequired,
    pluginId: PropTypes.string.isRequired,
  },

  mixins: [ApiMixin],

  getInitialState() {
    return {
      loading: true,
      testResults: '',
      processVariables: null,
      fields: null,
    };
  },

  UNSAFE_componentWillMount() {
    this.loadPluginDetails(this.props.pluginId);
  },

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.loadPluginDetails(this.props.pluginId);
  },

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !_.isEqual(nextState, this.state) ||
      !_.isEqual(nextProps.pluginId, this.props.pluginId)
    );
  },

  getPluginEndpoint(pluginId) {
    // TODO:
    const projectId = 'internal';
    const orgId = 'snpseq';
    return `/projects/${orgId}/${projectId}/plugins/${pluginId}/`;
  },

  loadPluginDetails(pluginId) {
    // TODO: we should be getting this from the plugin store or similar
    this.api.request(this.getPluginEndpoint(pluginId), {
      method: 'GET',
      data: {},
      success: (pluginDetails) => {
        this.setState({
          loading: false,
          fields: pluginDetails.views.start_sequence.fields,
        });
      },
      error: () => {
        IndicatorStore.addError(t('An error occurred'));
      },
    });
  },

  handleChange(value, config) {
    this.props.onChanged(config.name, value);
  },

  configToField(config) {
    return (
      <GenericField
        key={config.name}
        config={config}
        onChange={(value) => this.handleChange(value, config)}
      />
    );
  },

  render() {
    return (
      <Panel className={`plugin-config ref-plugin-config-${this.props.pluginId}`}>
        <PanelHeader hasButtons>
          <Flex align="center" flex="1">
            <span>{t('Process parameters')}</span>
          </Flex>
        </PanelHeader>
        <PanelBody px={2} pt={2} flex wrap="wrap">
          {this.state.testResults != '' ? (
            <div className="alert alert-block alert-warning">
              <strong>Test Results: </strong>
              <p>{this.state.testResults}</p>
            </div>
          ) : null}
          {this.state.loading ? (
            <LoadingIndicator />
          ) : (
            <div>
              <div>
                {this.state.fields.map((fieldConfig) => this.configToField(fieldConfig))}
              </div>
            </div>
          )}
        </PanelBody>
      </Panel>
    );
  },
});

export default ProcessTaskSettings;
