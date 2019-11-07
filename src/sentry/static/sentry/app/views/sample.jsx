import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import DocumentTitle from 'react-document-title';
import {Link} from 'react-router';

import ApiMixin from '../mixins/apiMixin';
import IndicatorStore from '../stores/indicatorStore';
import LoadingError from '../components/loadingError';
import LoadingIndicator from '../components/loadingIndicator';
import {t} from '../locale';

// {{TODO_TEMPLATE}}
// NOLIMS: Should be in clims

const SampleRow = createReactClass({
  displayName: 'SampleRow',

  propTypes: {
    onRemove: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    sample: PropTypes.object.isRequired,
  },

  mixins: [ApiMixin],

  getInitialState() {
    return {
      loading: false,
    };
  },

  onRemove() {
    if (this.state.loading) {
      return;
    }

    const sample = this.props.sample;

    this.setState(
      {
        loading: true,
      },
      () => {
        const loadingIndicator = IndicatorStore.add(t('Saving changes..'));
        this.api.request(`/samples/${sample.id}/`, {
          method: 'DELETE',
          success: data => {
            IndicatorStore.remove(loadingIndicator);
            this.props.onRemove();
          },
          error: () => {
            IndicatorStore.remove(loadingIndicator);
            IndicatorStore.add(
              t('Unable to remove application. Please try again.'),
              'error',
              {
                duration: 3000,
              }
            );
          },
        });
      }
    );
  },

  render() {
    const sample = this.props.sample;

    let btnClassName = 'btn btn-default';
    if (this.state.loading) {
      btnClassName += ' disabled';
    }
    const projectId = this.props.projectId;

    return (
      <tr>
        <td>
          <h4 style={{marginBottom: 5}}>
            <Link to={`/sentry/${projectId}/samples/${sample.id}/`}>{sample.name}</Link>
          </h4>
          <small style={{color: '#999'}}>{sample.id}</small>
        </td>
        <td style={{width: 32}}>
          <a
            onClick={this.onRemove.bind(this, sample)}
            className={btnClassName}
            disabled={this.state.loading}
          >
            <span className="icon icon-trash" />
          </a>
        </td>
      </tr>
    );
  },
});

const Samples = createReactClass({
  displayName: 'Samples',

  propTypes: {
    setProjectNavSection: PropTypes.func.isRequired,
  },

  contextTypes: {
    router: PropTypes.object.isRequired,
  },

  mixins: [ApiMixin],

  getInitialState() {
    return {
      loading: true,
      error: false,
      sampleList: [],
    };
  },

  UNSAFE_componentWillMount() {
    this.fetchData();
    this.props.setProjectNavSection('samples');
  },

  remountComponent() {
    this.setState(this.getInitialState(), this.fetchData);
  },

  fetchData() {
    this.setState({
      loading: true,
    });

    this.api.request('/samples/', {
      success: (data, _, jqXHR) => {
        this.setState({
          loading: false,
          error: false,
          sampleList: data,
        });
      },
      error: () => {
        this.setState({
          loading: false,
          error: true,
        });
      },
    });
  },

  createSample() {
    const loadingIndicator = IndicatorStore.add(t('Saving changes..'));
    // todo validate that it exists
    const {projectId} = this.props.params;
    this.api.request('/samples/', {
      method: 'POST',
      success: sample => {
        IndicatorStore.remove(loadingIndicator);
        this.context.router.push(`/sentry/${projectId}/samples/${sample.id}/`);
      },
      error: error => {
        IndicatorStore.remove(loadingIndicator);
        IndicatorStore.add(t('Unable to create sample. Please try again.'), 'error');
      },
    });
  },

  onRemoveSample(sample) {
    this.setState({
      sampleList: this.state.sampleList.filter(a => a.id !== sample.id),
    });
  },

  renderResults() {
    if (this.state.sampleList.length === 0) {
      return (
        <tr colSpan="2">
          <td className="blankslate well">{t('There are no samples in the project.')}</td>
        </tr>
      );
    }

    return this.state.sampleList.map(sample => {
      return (
        <SampleRow
          key={sample.id}
          sample={sample}
          projectId={this.props.params.projectId}
          onRemove={this.onRemoveSample.bind(this, sample)}
        />
      );
    });
  },

  getTitle() {
    return 'Samples';
  },

  render() {
    return (
      <DocumentTitle title={this.getTitle()}>
        <div>
          <table className="table">
            <tbody>
              {this.state.loading ? (
                <tr>
                  <td colSpan="2">
                    <LoadingIndicator />
                  </td>
                </tr>
              ) : this.state.error ? (
                <tr>
                  <td colSpan="2">
                    <LoadingError onRetry={this.fetchData} />
                  </td>
                </tr>
              ) : (
                this.renderResults()
              )}
            </tbody>
          </table>

          <div className="form-actions" style={{textAlign: 'right'}}>
            <a className="btn btn-primary ref-create-sample" onClick={this.createSample}>
              {t('Create Sample')}
            </a>
          </div>
        </div>
      </DocumentTitle>
    );
  },
});

export default Samples;
