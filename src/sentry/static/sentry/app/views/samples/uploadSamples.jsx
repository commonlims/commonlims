import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Modal from 'react-bootstrap/lib/Modal';

import {t} from 'app/locale';
import ApiMixin from 'app/mixins/apiMixin';
import IndicatorStore from 'app/stores/indicatorStore';
import {FormState} from 'app/components/forms';
import WorkflowFilter from 'app/views/samples/workflowFilter';
import ProcessTaskSettings from 'app/components/processTaskSettings';
import ProjectsStore from 'app/stores/projectsStore';
import OrganizationStore from 'app/stores/organizationsStore';
import SelectedSampleStore from 'app/stores/selectedSampleStore';
import UploadFile from 'app/components/uploadFile';
import SampleStore from 'app/stores/sampleStore';

const UploadSamplesButton = createReactClass({
  displayName: 'UploadSamplesButton',

  propTypes: {
    disabled: PropTypes.bool,
    style: PropTypes.object,
    tooltip: PropTypes.string,
    buttonTitle: PropTypes.string,
  },

  mixins: [ApiMixin],

  getInitialState() {
    let {orgId} = this.props;
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
    let formData = this.state.formData;
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
    if (!this.state.selectedFile) return;

    this.setState({state: FormState.SAVING}, () => {
      let loadingIndicator = IndicatorStore.add(t('Saving changes..'));

      // This endpoint should handle POSTs of single contracts as well as lists (batch). TODO(withrocks)
      // discuss if we rather want a specific batch endpoint.
      // TODO(withrocks): Validate if the user can access this org and if the samples are in the org
      let endpoint = `/user-files/`;
      const data = new FormData();

      let reader = new FileReader();
      reader.readAsBinaryString(this.state.selectedFile);

      reader.onload = function() {
        //data.append('file', this.state.selectedFile, this.state.selectedFile.name);
        let data = {
          content: btoa(reader.result),
          fileName: 'abc',
        };
        console.log(data);

        this.api.request(endpoint, {
          method: 'POST',
          data,
          success: response => {
            this.onToggle();
            this.setState({
              state: FormState.READY,
              errors: {},
            });

            // TODO: In later versions (post-poc) we'll want to upload the file to a queue rather than
            // processing it directly, as a number of plugins may need to handle it and may time out.
            // In that case, this logic needs to be set on a timer/callback:
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
        console.log('onError');
        this.setState({
          state: FormState.ERROR,
        });
      };
    });
  },

  render() {
    let isSaving = this.state.state === FormState.SAVING;
    let user = {};
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
