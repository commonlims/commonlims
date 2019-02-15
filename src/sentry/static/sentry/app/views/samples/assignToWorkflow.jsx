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
import PluginsStore from 'app/stores/pluginsStore';

const AssignToWorkflowButton = createReactClass({
  displayName: 'AssignToWorkflowButton',

  propTypes: {
    orgId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    query: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    style: PropTypes.object,
    tooltip: PropTypes.string,
    buttonTitle: PropTypes.string,

    // onAssign: PropTypes.func.isRequired,
  },

  mixins: [ApiMixin],

  getInitialState() {
    let {orgId, projectId} = this.props;

    // TODO(withrocks): Is this an acceptable pattern to get the org/project objects from ids?
    let organization = OrganizationStore.get(orgId);
    let project = ProjectsStore.getBySlug(projectId);

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
      project,
      setProcessVariables: {},
    };
  },

  onVariableChange(key, value) {
    let updated = Object.assign({}, this.state.setProcessVariables);
    updated[key] = value;
    this.setState({
      setProcessVariables: updated,
    });

    console.log('HERE!!!!', this.state.setProcessVariables);
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
        let loadingIndicator = IndicatorStore.add(t('Saving changes..'));
        let {orgId} = this.props;

        // This endpoint should handle POSTs of single contracts as well as lists (batch). TODO(withrocks)
        // discuss if we rather want a specific batch endpoint.
        // TODO(withrocks): Validate if the user can access this org and if the samples are in the org
        let endpoint = `/processes/${orgId}/sample-processes/`;

        let data = {
          samples: [],
          variables: this.state.setProcessVariables,
          process: this.state.process,
          something: 'abc',
        };
        for (let a of SelectedSampleStore.getSelectedIds()) {
          // TODO: Don't know why I need to do this vs. just using the set
          data.samples.push(a);
        }

        console.log('HERE posting', data);

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
    let vars = [
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

  render() {
    let isSaving = this.state.state === FormState.SAVING;
    // TODO: This is all hardcoded to snpseq to test how the plugin model
    // could work, but this needs to support any system and just send events to plugin handlers.

    // TODO: Get that plugins node from the PluginsStore instead
    // console.log(PluginsStore.plugins);

    // TODO(withrocks):
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
              <p>
                {t(
                  'Assigning the samples to a workflow will immediately start the workflow.'
                )}
              </p>

              {/* TODO: fetch all workflows that are on per-sample level from the plugin definitions
                  TODO: the value doesn't stick around (anymore)
              */}
              <WorkflowFilter
                value={this.state.value}
                key="is"
                tag={{
                  key: 'is',
                  name: 'Status',
                  values: [
                    'clims_snpseq.core.workflows.sequence',
                    'clims_snpseq.core.workflows.alt',
                  ],
                  predefined: true,
                }}
                onSelect={this.onSelectWorkflow}
                orgId="sentry"
                projectId="rc-0123"
              />

              <br />
              {this.state.workflowVars && (
                <ProcessTaskSettings
                  organization={this.state.organization}
                  project={this.state.project}
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
