import {Flex} from 'grid-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';

import {t} from 'app/locale';
import ApiMixin from 'app/mixins/apiMixin';
import IndicatorStore from 'app/stores/indicatorStore';
import LoadingIndicator from 'app/components/loadingIndicator';
import {Panel, PanelBody, PanelHeader} from 'app/components/panels';
import plugins from 'app/plugins';
import {GenericField} from 'app/components/forms';

const ProcessTaskSettings = createReactClass({
  displayName: 'ProcessTaskSettings',

  propTypes: {
    organization: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired,
    onChanged: PropTypes.func.isRequired,
    processVarsViewKey: PropTypes.string.isRequired,
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

  componentWillMount() {
    this.loadPluginDetails(this.props.pluginId);
  },

  componentWillReceiveProps(nextProps) {
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
    let projectId = 'rc-0123';
    let orgId = 'sentry';
    return `/projects/${orgId}/${projectId}/plugins/${pluginId}/`;
  },

  loadPluginDetails(pluginId) {
    // TODO: we should be getting this from the plugin store or similar
    console.log('about to load');
    this.api.request(this.getPluginEndpoint(pluginId), {
      method: 'GET',
      data: {},
      success: pluginDetails => {
        console.log('loaded', pluginDetails);
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

  createMarkup() {
    return {__html: this.props.data.doc};
  },

  handleChange(value, config) {
    this.props.onChanged(config.name, value);
  },

  configToField(config) {
    return (
      <GenericField
        key={config.name}
        config={config}
        onChange={value => this.handleChange(value, config)}
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
          {/* <div dangerouslySetInnerHTML={this.createMarkup()} /> */}
          {this.state.loading ? (
            <LoadingIndicator />
          ) : (
            <div>
              <div>
                {this.state.fields.map(fieldConfig => this.configToField(fieldConfig))}
              </div>
            </div>
          )}
        </PanelBody>
      </Panel>
    );
  },
});

export default ProcessTaskSettings;
