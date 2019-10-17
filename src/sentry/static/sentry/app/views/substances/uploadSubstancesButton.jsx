import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'react-bootstrap/lib/Modal';

import {t} from 'app/locale';
import {FormState} from 'app/components/forms';
import IndicatorStore from 'app/stores/indicatorStore';
import {Client} from 'app/api';

class UploadSubstancesButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false,
      errors: {},
      value: null,
      selectedFile: null,
      loaded: 0,
    };

    this.onToggle = this.onToggle.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handleSelectedFile = this.handleSelectedFile.bind(this);
    this.api = new Client();
  }

  onToggle() {
    if (this.props.disabled) {
      return;
    }
    this.setState({
      isModalOpen: !this.state.isModalOpen,
      state: FormState.READY,
    });
  }

  handleSelectedFile(event) {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
    });
  }

  handleDownload(event) {
    fetch('/api/0/organizations/lab/substances/files/demo/')
      .then(resp => resp.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        // the filename you want
        a.download = 'demo-sample-submission.xlsx'; // TODO: Get from header
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => {
        this.setState({
          state: FormState.ERROR,
          // TODO: Add error message
        });
      });
  }

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
  }

  render() {
    const isSaving = this.state.state === FormState.SAVING;
    return (
      <React.Fragment>
        <a
          title={this.props.tooltip || this.props.buttonTitle}
          className="btn btn-sm btn-default"
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

            {/* TODO: Make pretty! Look e.g. into avatar uploading which
                      doesn't use the default file upload look */}
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
              {/* todo: dev only */}
              <button
                type="button"
                onClick={this.handleDownload}
                className="btn btn-default"
                disabled={isSaving}
              >
                {t('Download example')}
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
  }
}

UploadSubstancesButton.propTypes = {
  tooltip: PropTypes.string,
  buttonTitle: PropTypes.string,
  disabled: PropTypes.bool,
};

export default UploadSubstancesButton;
