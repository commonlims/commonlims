import {Flex} from 'reflexbox';
import PropTypes from 'prop-types';
import React from 'react';

import {FormState} from 'app/components/forms';
import {parseRepo} from 'app/utils';
import {t, tct} from 'app/locale';
import LoadingIndicator from 'app/components/loadingIndicator';
import PluginComponentBase from 'app/components/bases/pluginComponentBase';

class ProcessSettings extends PluginComponentBase {
  constructor(props, context) {
    super(props, context);

    Object.assign(this.state, {
      fieldList: null,
      initialData: null,
      formData: null,
      errors: {},
      rawData: {},
      // override default FormState.READY if api requests are
      // necessary to even load the form
      state: FormState.LOADING,
    });
  }

  componentDidMount() {
    this.fetchData();
  }

  getPluginEndpoint() {
    const org = this.props.organization;
    const project = this.props.project;
    return `/projects/${org.slug}/${project.slug}/plugins/${this.props.plugin.id}/`;
  }

  changeField(name, value) {
    const formData = this.state.formData;
    formData[name] = value;
    // upon changing a field, remove errors
    const errors = this.state.errors;
    delete errors[name];
    this.setState({formData, errors});
    this.props.onChanged(formData);
  }

  onSubmit() {
    let repo = this.state.formData.repo;
    repo = repo && parseRepo(repo);
    const parsedFormData = {...this.state.formData, repo};
    this.api.request(this.getPluginEndpoint(), {
      data: parsedFormData,
      method: 'PUT',
      success: this.onSaveSuccess.bind(this, (data) => {
        const formData = {};
        const initialData = {};
        data.config.forEach((field) => {
          formData[field.name] = field.value || field.defaultValue;
          initialData[field.name] = field.value;
        });
        this.setState({
          fieldList: data.config,
          formData,
          initialData,
          errors: {},
        });
      }),
      error: this.onSaveError.bind(this, (error) => {
        this.setState({
          errors: (error.responseJSON || {}).errors || {},
        });
      }),
      complete: this.onSaveComplete,
    });
  }

  fetchData() {
    this.api.request(this.getPluginEndpoint(), {
      success: (data) => {
        // TODO: get the view required through an input parameter
        const view = data.views[this.props.viewKey];
        const viewFields = view.fields;

        const formData = {};
        const initialData = {};
        viewFields.forEach((field) => {
          formData[field.name] = field.value || field.defaultValue;
          initialData[field.name] = field.value;
        });
        this.setState(
          {
            fieldList: viewFields,
            formData,
            initialData,
            // call this here to prevent FormState.READY from being
            // set before fieldList is
          },
          this.onLoadSuccess
        );
      },
      error: this.onLoadError,
    });
  }

  render() {
    if (this.state.state === FormState.LOADING) {
      return <LoadingIndicator />;
    }

    const data = this.state.rawData;
    if (data.config_error) {
      let authUrl = data.auth_url;
      if (authUrl.indexOf('?') === -1) {
        authUrl += '?next=' + encodeURIComponent(document.location.pathname);
      } else {
        authUrl += '&next=' + encodeURIComponent(document.location.pathname);
      }
      return (
        <div className="m-b-1">
          <div className="alert alert-warning m-b-1">{data.config_error}</div>
          <a className="btn btn-primary" href={authUrl}>
            {t('Associate Identity')}
          </a>
        </div>
      );
    }

    if (this.state.state === FormState.ERROR && !this.state.fieldList) {
      return (
        <div className="alert alert-error m-b-1">
          {tct('An unknown error occurred. Need help with this? [link:Contact support]', {
            link: <a href="https://sentry.io/support/" />,
          })}
        </div>
      );
    }

    if (!(this.state.fieldList || []).length) {
      return null;
    }
    return (
      <Flex direction="column">
        {this.state.errors.__all__ && (
          <div className="alert alert-block alert-error">
            <ul>
              <li>{this.state.errors.__all__}</li>
            </ul>
          </div>
        )}
        {this.state.fieldList.map((f) => {
          return this.renderField({
            key: f.name,
            config: f,
            formData: this.state.formData,
            formErrors: this.state.errors,
            onChange: this.changeField.bind(this, f.name),
          });
        })}
      </Flex>
    );
  }
}

ProcessSettings.propTypes = {
  organization: PropTypes.object.isRequired,
  project: PropTypes.object.isRequired,
  plugin: PropTypes.object.isRequired,
};

export default ProcessSettings;
