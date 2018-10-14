import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import DocumentTitle from 'react-document-title';

import ApiMixin from '../mixins/apiMixin';
import {FormState, TextField} from '../components/forms';
import IndicatorStore from '../stores/indicatorStore';
import LoadingError from '../components/loadingError';
import LoadingIndicator from '../components/loadingIndicator';
import WorkflowTable from '../components/workflowTable/workflowTable';
import {t} from '../locale';
import {Client} from 'app/api';

const SampleDetails = createReactClass({
  displayName: 'SampleDetails',

  contextTypes: {
    router: PropTypes.object.isRequired,
  },

  mixins: [ApiMixin],

  getInitialState() {
    return {
      loading: true,
      error: false,
      sampleId: null,
      formData: null,
      errors: {},
    };
  },

  componentWillMount() {
    this.fetchData();
  },

  remountComponent() {
    this.setState(this.getInitialState(), this.fetchData);
  },

  getFormData(sample) {
    return {
      name: sample.name,
    };
  },

  fetchData() {
    this.setState({
      loading: true,
    });

    this.api.request(`/samples/${this.props.params.sampleId}/`, {
      success: (data, _, jqXHR) => {

        this.setState({ loading: false, error: false, sample: data,
          formData: {...this.getFormData(data)}, errors: {},
        });

      },
      error: () => {
        this.setState({ loading: false, error: true, });
      },
    });
  },

  onFieldChange(name, value) {
    let formData = this.state.formData;
    formData[name] = value;
    this.setState({
      formData,
    });
  },

  onSubmit(e) {
    e.preventDefault();

    if (this.state.state == FormState.SAVING) {
      return;
    }
    this.setState(
      {
        state: FormState.SAVING,
      },
      () => {
        let loadingIndicator = IndicatorStore.add(t('Saving changes..'));
        let formData = this.state.formData;
        this.api.request(`/samples/${this.props.params.sampleId}/`, {
          method: 'PUT',
          data: {
            ...formData,
          },
          success: data => {
            IndicatorStore.remove(loadingIndicator);
            this.setState({
              state: FormState.READY,
              formData: {...this.getFormData(data)},
              errors: {},
            });
            //this.context.router.push('/api/applications/');
          },
          error: error => {
            IndicatorStore.remove(loadingIndicator);
            this.setState({
              state: FormState.ERROR,
              errors: error.responseJSON,
            });
          },
        });
      }
    );
  },

  onRemoveSample(sample) {},

  getTitle() {
    return 'Sample Details';
  },

  render() {
    if (this.state.loading) return <LoadingIndicator />;
    else if (this.state.error) return <LoadingError onRetry={this.fetchData} />;

    let isSaving = this.state.state === FormState.SAVING;
    let errors = this.state.errors;

    return (
      <DocumentTitle title={this.getTitle()}>
        <div>
          <form onSubmit={this.onSubmit} className="form-stacked">
            <h4>{t('Sample details')}</h4>
            {this.state.state === FormState.ERROR && (
              <div className="alert alert-error alert-block">
                {t(
                  'Unable to save your changes. Please ensure all fields are valid and try again.'
                )}
              </div>
            )}
            <fieldset>
              <TextField
                key="name"
                name="name"
                label={t('Name')}
                placeholder={t('e.g. submission-org1-2018-01-01')}
                value={this.state.formData.name}
                required={true}
                error={errors.name}
                onChange={this.onFieldChange.bind(this, 'name')}
              />
            </fieldset>
            <fieldset className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {t('Save Changes')}
              </button>
            </fieldset>
          </form>
          <SampleWorkflows params={this.props.params} />
        </div>
      </DocumentTitle>
    );
  },
});

class SampleWorkflows extends React.Component {

  getInitialState() {
    return {
      loading: true,
      error: false,
      sampleId: null,
      formData: null,
      workflows: null,
      errors: {},
    };
  }

  componentWillMount() {
    this.api = new Client();
    this.fetchData();
  }

  componentWillUnmount() {
    this.api.clear();
  }

  remountComponent() {
    this.setState(this.getInitialState(), this.fetchData);
  }

  fetchData() {
    this.setState({
      loading: true,
    });

    this.api.request(`/samples/${this.props.params.sampleId}/workflows/`, {
      success: (data, _, jqXHR) => {
        this.setState({ loading: false, error: false, workflows: data, errors: {} });
      },
      error: () => {
        this.setState({ loading: false, error: true, });
      },
    });
  }

  render() {
    let isSaving = this.state.state === FormState.SAVING;

    if (this.state.loading) return <LoadingIndicator />;
    else if (this.state.error) return <LoadingError onRetry={this.fetchData} />;

    return (
        <div>
            <WorkflowTable workflows={this.state.workflows} params={this.props.params} />
            <fieldset>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {t('Add workflow')}
              </button>
            </fieldset>
        </div>
    );
  }
}


export default SampleDetails;
