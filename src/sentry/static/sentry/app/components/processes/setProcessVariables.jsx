import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Modal from 'react-bootstrap/lib/Modal';

import {t} from 'app/locale';
import ApiMixin from 'app/mixins/apiMixin';
import IndicatorStore from 'app/stores/indicatorStore';
import {FormState} from 'app/components/forms';
import ProcessTaskSettings from 'app/components/processTaskSettings';
import ProjectsStore from 'app/stores/projectsStore';
import OrganizationStore from 'app/stores/organizationsStore';

// TODO(withrocks): This view is very similar to assignToWorkflow.jsx, so
// we might want to join those two
const SetProcessVariables = createReactClass({
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
      setProcessVariables: null,
    };
  },

  onVariableChange(data) {
    this.setState({setProcessVariables: data});
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
          processInstanceId: '143438f',
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
    // Fetch the variables for this, if they don't exist yet:
  },

  render() {
    let isSaving = this.state.state === FormState.SAVING;

    // TODO(withrocks): mocked
    let node = {
      data: {
        isTestable: false,
        views: {},
        hasConfiguration: true,
        shortName: 'SnpSeq',
        config: {},
        id: 'snpseq',
        assets: [{url: '_static/1539772060/snpseq/dist/snpseq.js'}],
        name: 'SnpSeq',
        author: {
          url: 'https://github.com/getsentry/sentry-plugins',
          name: 'Sentry Team',
        },
        contexts: {},
        doc: '',
        resourceLinks: {},
        enabled: true,
        slug: 'snpseq',
        version: '9.1.0.dev0',
        canDisable: true,
        type: 'default',
        metadata: {},
      },
    };
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
              <h4>{t('Set process level parameters')}</h4>
            </div>
            <div className="modal-body">
              {this.state.state === FormState.ERROR && (
                <div className="alert alert-error alert-block">
                  {t(`Unable to save your changes. ${this.state.errors}`)}
                </div>
              )}
              <p>
                {t(
                  'Setting process level variables will move the task further in the process.'
                )}
              </p>

              {/* TODO: fetch all workflows that are on per-sample level from the plugin definitions
                  TODO: the value doesn't stick around (anymore)
              */}
              <ProcessTaskSettings
                organization={this.state.organization}
                project={this.state.project}
                data={node.data}
                onChanged={this.onVariableChange}
                processVarsViewKey="sequence.create_library.reception_qc.select_qc_method"
              />
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
                {t('Ok')}
              </button>
            </div>
          </form>
        </Modal>
      </React.Fragment>
    );
  },
});

export default SetProcessVariables;
