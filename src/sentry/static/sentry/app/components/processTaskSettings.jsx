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

const ProcessTaskSettings = createReactClass({
  displayName: 'ProcessTaskSettings',

  propTypes: {
    organization: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    onChanged: PropTypes.func.isRequired,
    processVarsViewKey: PropTypes.string.isRequired,
  },

  mixins: [ApiMixin],

  getInitialState() {
    return {
      loading: !plugins.isLoaded(this.props.data),
      testResults: '',
      processVariables: null,
    };
  },

  componentWillMount() {
    this.loadPlugin(this.props.data);
  },

  componentWillReceiveProps(nextProps) {
    this.loadPlugin(nextProps.data);
  },

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !_.isEqual(nextState, this.state) || !_.isEqual(nextProps.data, this.props.data)
    );
  },

  loadPlugin(data) {
    this.setState(
      {
        loading: true,
      },
      () => {
        plugins.load(data, () => {
          this.setState({loading: false});
        });
      }
    );
  },

  getPluginEndpoint() {
    let {organization, project, data} = this.props;
    return `/projects/${organization.slug}/${project.slug}/plugins/${data.id}/`;
  },

  testPlugin() {
    let loadingIndicator = IndicatorStore.add(t('Sending test..'));
    this.api.request(this.getPluginEndpoint(), {
      method: 'POST',
      data: {
        test: true,
      },
      success: data => {
        this.setState({testResults: JSON.stringify(data.detail)});
        IndicatorStore.remove(loadingIndicator);
        IndicatorStore.add(t('Test Complete!'), 'success');
      },
      error: error => {
        IndicatorStore.add(
          t('An unexpected error occurred while testing your plugin. Please try again.'),
          'error'
        );
      },
    });
  },

  createMarkup() {
    return {__html: this.props.data.doc};
  },

  onChanged(data) {
    this.setState({processVariables: data});
  },

  render() {
    let {data} = this.props;

    return (
      <Panel className={`plugin-config ref-plugin-config-${data.id}`}>
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
          <div dangerouslySetInnerHTML={this.createMarkup()} />
          {this.state.loading ? (
            <LoadingIndicator />
          ) : (
            plugins.get(data).renderProcessVars({
              organization: this.props.organization,
              project: this.props.project,
              viewKey: this.props.processVarsViewKey,
              onChanged: this.props.onChanged,
            })
          )}
        </PanelBody>
      </Panel>
    );
  },
});

export default ProcessTaskSettings;
