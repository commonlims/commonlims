import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Modal from 'react-bootstrap/lib/Modal';

import {t} from 'app/locale';
import ApiMixin from 'app/mixins/apiMixin';
import IndicatorStore from 'app/stores/indicatorStore';
import {FormState} from 'app/components/forms';

const UploadSamplesButton = createReactClass({
  displayName: 'UploadSamplesButton',

  propTypes: {
    disabled: PropTypes.bool,
    style: PropTypes.object,
    tooltip: PropTypes.string,
    buttonTitle: PropTypes.string,
    query: PropTypes.string,
  },

  mixins: [ApiMixin],

  getInitialState() {
    return {
      isModalOpen: false,
      formData: {
        query: this.props.query,
      },
      errors: {},
      value: null,
      workflowVars: null,
      workflowVars2: null,
      setProcessVariables: null,
      selectedFile: null,
      loaded: 0,
    };
  },

  onVariableChange(data) {
    this.setState({
      setProcessVariables: data,
    });
  },

  onToggle() {
    if (this.props.disabled) {
      return;
    }
    this.setState({
      isModalOpen: !this.state.isModalOpen,
      state: FormState.READY,
      formData: {
        query: this.props.query,
      },
    });
  },

  onFieldChange(name, value) {
    const formData = this.state.formData;
    formData[name] = value;
    this.setState({
      formData,
    });
  },

  onDefaultChange(e) {
    this.onFieldChange('isDefault', e.target.checked);
  },

  onUserDefaultChange(e) {
    this.onFieldChange('isUserDefault', e.target.checked);
  },

  handleSubmitSucces(user) {
    //updateUser(user);
    //this.setState({user});
  },

  handleSelectedFile(event) {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
    });
  },

  handleUpload(event) {
    if (!this.state.selectedFile) {
      return;
    }

    this.setState({state: FormState.SAVING}, () => {
      const loadingIndicator = IndicatorStore.add(t('Saving changes..'));

      const endpoint = '/organizations/lab/substances/files/';

      const reader = new FileReader();
      reader.readAsBinaryString(this.state.selectedFile);

      reader.onload = function() {
        const data = {
          content: btoa(reader.result),
          filename: this.state.selectedFile.name,
        };

        this.api.request(endpoint, {
          method: 'POST',
          data,
          success: response => {
            this.onToggle();
            this.setState({
              state: FormState.READY,
              errors: {},
            });
          },
          error: err => {
            let errors = err.responseJSON || true;
            errors = errors.detail || true;
            this.setState({
              state: FormState.ERROR,
              errors,
            });
          },
          complete: () => {
            IndicatorStore.remove(loadingIndicator);
          },
        });
      }.bind(this);

      reader.onError = function() {
        this.setState({
          state: FormState.ERROR,
        });
      };
    });
  },

  render() {
    const isSaving = this.state.state === FormState.SAVING;
    return (
      <React.Fragment>
        <a
          title={this.props.tooltip || this.props.buttonTitle}
          className={this.props.className}
          disabled={this.props.disabled}
          onClick={this.onToggle}
          style={this.props.style}
        >
          {this.props.children}
        </a>
        <Modal show={this.state.isModalOpen} animation={false} onHide={this.onToggle}>
          <form onSubmit={this.onSubmit}>
            <div className="modal-header">
              <h4>{t('Upload file')}</h4>
            </div>

            {/* TODO: Make pretty! Look e.g. into avatar uploading which doesn't use the default file upload look */}
            <div className="modal-body">
              {this.state.state === FormState.ERROR && (
                <div className="alert alert-error alert-block">
                  {t(`Unable to upload the file. ${this.state.errors}`)}
                </div>
              )}
              <input type="file" name="" id="" onChange={this.handleSelectedFile} />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-default"
                disabled={isSaving}
                onClick={this.onToggle}
              >
                {t('Cancel')}
              </button>
              <button
                type="button"
                onClick={this.handleUpload}
                className="btn btn-primary"
                disabled={isSaving}
              >
                {t('Upload')}
              </button>
            </div>
          </form>
        </Modal>
      </React.Fragment>
    );
  },
});

export default UploadSamplesButton;
