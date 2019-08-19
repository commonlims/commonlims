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
import {withRouter} from 'react-router';

const WorkOnButton = createReactClass({
  // A button/view that allows the user to work on several samples that are in a waiting queue
  // This is in a separate class as we may want either to redirect to a page or show a modal window
  // based on the UserAction in question
  // TODO: For now we always redirect
  displayName: 'WorkOnButton',

  propTypes: {
    orgId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    query: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    style: PropTypes.object,
    tooltip: PropTypes.string,
    buttonTitle: PropTypes.string,
    router: PropTypes.shape({
      push: PropTypes.function,
    }),
  },

  mixins: [ApiMixin],

  getInitialState() {
    const {orgId, projectId} = this.props;

    // TODO(withrocks): Is this an acceptable pattern to get the org/project objects from ids?
    const organization = OrganizationStore.get(orgId);
    const project = ProjectsStore.getBySlug(projectId);

    return {
      isActivated: false,
      formData: {
        query: this.props.query,
      },
      errors: {},
      value: null,
      workflowVars: null,
      workflowVars2: null,
      organization,
      project,
      setProcessVariables: null,
    };
  },

  shouldRedirect() {
    return true;
  },

  onVariableChange(data) {
    this.state.setState({setProcessVariables: data});
  },

  onToggle() {
    if (this.props.disabled) {
      return;
    }
    this.setState({
      isActivated: !this.state.isActivated,
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
        const loadingIndicator = IndicatorStore.add(t('Saving changes..'));
        const {orgId} = this.props;

        // This endpoint should handle POSTs of single contracts as well as lists (batch). TODO(withrocks)
        // discuss if we rather want a specific batch endpoint.
        // TODO(withrocks): Validate if the user can access this org and if the samples are in the org
        const endpoint = `/processes/${orgId}/sample-processes/`;

        const data = {
          samples: SelectedSampleStore.getSelectedIds(),
          variables: this.state.setProcessVariables,
          process: this.state.process,
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
    // Fetch the variables for this, if they don't exist yet:
  },

  startWorkBatch() {
    // 1. POST all these samples to the work-batch endpoint.
    // 2. Redirect to the work batch site
    this.props.router.push('/sentry/internal/plugins/clims_snpseq/fragment_analyze/123/');

    /*
    this.api.request('/work-batch/', {
      method: 'POST',
      data: {
        samples: [1, 2, 3]
      },
      error: error => {
        this.setState({
          loading: false,
          error: true,
          isActivated: false,  // yeah, this pattern is weird, I know (POCing here)
        });
      },
      success: data => {
        // TODO:project
        this.props.router.push(`/sentry/internal/work-batch/${data.id}`);
      }
    });*/
  },

  render() {
    // TODO: Create another component for this
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

        {/* Generally, we redirect to another view, but (later) we should implement fixing
            simpler tasks in a modal window (see sketch below).
        */}
        {this.state.isActivated && this.shouldRedirect() && this.startWorkBatch()}

        <Modal
          show={this.state.isActivated && !this.shouldRedirect()}
          animation={false}
          onHide={this.onToggle}
        >
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
                projectId="internal"
              />

              <br />
              {this.state.workflowVars && (
                <ProcessTaskSettings
                  organization={this.state.organization}
                  project={this.state.project}
                  data={null}
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

export default withRouter(WorkOnButton);
