import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import DocumentTitle from 'react-document-title';

import ApiMixin from '../mixins/apiMixin';
import {FormState, TextField, TextareaField} from '../components/forms';
import IndicatorStore from '../stores/indicatorStore';
import LoadingError from '../components/loadingError';
import LoadingIndicator from '../components/loadingIndicator';
import {t} from '../locale';

// {{TODO_TEMPLATE}}

const SampleGroupDetails = createReactClass({
  displayName: 'ApiApplicationDetails',

  contextTypes: {
    router: PropTypes.object.isRequired,
  },

  mixins: [ApiMixin],

  getInitialState() {
    return {
      loading: true,
      error: false,
      app: null,
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

  getFormData(app) {
    return {
      name: app.name,
      description: app.description,
      csv: app.csv,
      status: 'created',
    };
  },

  fetchData() {
    this.setState({
      loading: true,
    });

    this.api.request(`/sample-groups/${this.props.params.appId}/`, {
      success: (data, _, jqXHR) => {
        this.setState({
          loading: false,
          error: false,
          app: data,
          formData: {...this.getFormData(data)},
          errors: {},
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
        this.api.request(`/sample-groups/${this.props.params.appId}/`, {
          method: 'PUT',
          // TODO: currently you could change the sample group's status via this endpoint,
          // control that with authorization setting
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

  onRemoveApplication(app) {},

  getTitle() {
    return 'Application Details';
  },

  render() {
    if (this.state.loading) return <LoadingIndicator />;
    else if (this.state.error) return <LoadingError onRetry={this.fetchData} />;

    //let app = this.state.app;
    let isSaving = this.state.state === FormState.SAVING;
    let errors = this.state.errors;

    return (
      <DocumentTitle title={this.getTitle()}>
        <div>
          <form onSubmit={this.onSubmit} className="form-stacked">
            <h4>{t('Sample group details')}</h4>
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
              <TextField
                key="description"
                name="description"
                label={t('Description')}
                value={this.state.formData.description}
                help={t('An optional description')}
                required={false}
                error={errors.description}
                onChange={this.onFieldChange.bind(this, 'description')}
              />
              <TextareaField
                key="csv"
                name="csv"
                label={t('Submitted CSV')}
                value={this.state.formData.csv}
                required={false}
                help={t('CSV for creating sample group')}
                placeholder={t('e.g. name;volume;concentration')}
                error={errors.csv}
                onChange={this.onFieldChange.bind(this, 'csv')}
              />
              <TextField
                key="status"
                name="status"
                label={t('Status')}
                value={this.state.formData.status}
                required={false}
                error={errors.status}
                disabled={true}
              />
            </fieldset>
            <fieldset className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {t('Save Changes')}
              </button>
            </fieldset>
          </form>
        </div>
      </DocumentTitle>
    );
  },
});

export default SampleGroupDetails;
