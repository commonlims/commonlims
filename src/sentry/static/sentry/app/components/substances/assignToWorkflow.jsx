import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Modal from 'react-bootstrap/lib/Modal';

import {t} from 'app/locale';
import IndicatorStore from 'app/stores/indicatorStore';
import {FormState} from 'app/components/forms';
// import WorkflowFilter from 'app/components/substances/workflowFilter';
import ProcessTaskSettings from 'app/components/processTaskSettings';
import OrganizationStore from 'app/stores/organizationsStore';
import SelectedSampleStore from 'app/stores/selectedSampleStore';
import SelectControl from 'app/components/forms/selectControl';

// TODO: Write tests for this component
const AssignToWorkflowButton = createReactClass({
  displayName: 'AssignToWorkflowButton',

  propTypes: {
    orgId: PropTypes.string.isRequired,
    query: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    style: PropTypes.object,
    tooltip: PropTypes.string,
    buttonTitle: PropTypes.string,
  },

  getInitialState() {
    const {orgId} = this.props;
    const organization = OrganizationStore.get(orgId);
    return {
      isModalOpen: false,
      formData: {
        query: this.props.query,
      },
      errors: {},
      value: null,
      workflowVars: null,
      workflowVars2: null,
      organization,
      setProcessVariables: {},
      selectedWorkflow: null,
    };
  },

  onVariableChange(key, value) {
    const updated = Object.assign({}, this.state.setProcessVariables);
    updated[key] = value;
    this.setState({
      setProcessVariables: updated,
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
        // TODO: Start the process
        const loadingIndicator = IndicatorStore.add(t('Saving changes..'));
        const {orgId} = this.props;

        // TODO: Validate if the user can access this org and if the samples are in the org
        const endpoint = `/processes/${orgId}/sample-processes/`;

        const data = {
          samples: [],
          variables: this.state.setProcessVariables,
          process: this.state.process,
          something: 'abc',
        };
        for (const a of SelectedSampleStore.getSelectedIds()) {
          // TODO: Don't know why I need to do this vs. just using the set
          data.samples.push(a);
        }

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
      }
    );
  },

  onSelectWorkflow(key, value) {
    const vars = [
      {
        name: 'Sequencer',
        type: 'string',
        required: true,
        label: t('Sequencer'),
        placeholder: value,
      },
    ];

    this.setState(state => ({workflowVars: vars, value, process: value}));
  },

  // TODO: Change to JS6 class
  onWorkflowSelected(sel) {
    this.setState({
      selectedWorkflow: sel.value,
    });
  },

  render() {
    const isSaving = this.state.state === FormState.SAVING;

    const options = [
      {
        value: 'workflow-1',
        label: 'Sequence',
      },
      {
        value: 'workflow-2',
        label: 'Something else',
      },
    ];

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
              <h4>{t('Assign samples to workflow')}</h4>
            </div>
            <div className="modal-body">
              {this.state.state === FormState.ERROR && (
                <div className="alert alert-error alert-block">
                  {t(`Unable to save your changes. ${this.state.errors}`)}
                </div>
              )}

              <div className="stream-tag-filter">
                <h6 className="nav-header">Workflow</h6>
                <SelectControl
                  onChange={this.onWorkflowSelected}
                  placeholder="Select workflow"
                  options={options}
                  value={this.state.selectedWorkflow}
                />
              </div>
              <br />
              {this.state.workflowVars && (
                <ProcessTaskSettings
                  organization={this.state.organization}
                  pluginId="snpseq"
                  onChanged={this.onVariableChange}
                  processVarsViewKey="start_sequence"
                />
              )}
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
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {t('Assign')}
              </button>
            </div>
          </form>
        </Modal>
      </React.Fragment>
    );
  },
});

export default AssignToWorkflowButton;
