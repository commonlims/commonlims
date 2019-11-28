import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Modal from 'react-bootstrap/lib/Modal';
import {connect} from 'react-redux';

import {t} from 'app/locale';
import SelectControl from 'app/components/forms/selectControl';
import {processDefinitionsGet} from 'app/redux/actions/processDefinition';
import {processesPost} from 'app/redux/actions/process';

import JsonForm from 'app/views/settings/components/forms/jsonForm';
import LoadingIndicator from 'app/components/loadingIndicator';

import {
  processAssignSelectPreset,
  processAssignSelectProcess,
  processAssignSetVariable,
} from 'app/redux/actions/processAssign';

// TODO: Write tests for this component
// TODO: Change to JS6 class
const AssignToWorkflowButton = createReactClass({
  displayName: 'AssignToWorkflowButton',

  propTypes: {
    disabled: PropTypes.bool,
    style: PropTypes.object,
    tooltip: PropTypes.string,
    buttonTitle: PropTypes.string,
    processDefinition: PropTypes.object,
    process: PropTypes.object,
    substanceSearchEntry: PropTypes.object,
    processesPost: PropTypes.func,
    processDefinitionsGet: PropTypes.func,
    processAssignSelectPreset: PropTypes.func.isRequired,
    processAssignSelectProcess: PropTypes.func.isRequired,
    processAssignSetVariable: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      isModalOpen: false,
      errors: {},
      value: null,
      setProcessVariables: {},
      selectedProcess: null,
      selectedPreset: null,
      variables: {},
    };
  },

  UNSAFE_componentWillMount() {
    this.props.processDefinitionsGet();
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
    });
  },

  onSubmit(e) {
    e.preventDefault();

    if (this.props.process.saving) {
      return;
    }

    // TODO: substances already selected
    this.props.processesPost(
      this.state.selectedProcess,
      this.state.variables,
      this.props.substanceSearchEntry.selectedIds.toArray()
    );
  },

  createFieldsFromDefinition(processDefinition) {
    return processDefinition.fields.map(fieldConfig => {
      const field = Object.assign({}, fieldConfig);
      field.onChange = val => this.props.processAssignSetVariable(field.name, val);
      return field;
    });
  },

  renderSettings() {
    let fields = null;
    const {assignProcessDefinition, assignVariables} = this.props.processDefinition;

    if (assignProcessDefinition) {
      fields = this.createFieldsFromDefinition(assignProcessDefinition);
    } else {
      fields = [];
    }

    for (const field of fields) {
      field.value = assignVariables[field.name];
    }

    return <JsonForm title={t('Settings')} fields={fields} />;
  },

  render() {
    if (this.props.processDefinition.loading) {
      return <LoadingIndicator />;
    }

    const presets = Object.entries(
      this.props.processDefinition.presetsById
    ).map(entry => {
      return {value: entry[0], label: entry[1].name};
    });

    const processDefinitions = Object.entries(
      this.props.processDefinition.processDefinitionsById
    ).map(entry => {
      return {value: entry[0], label: entry[1].id};
    });

    const {assignPreset, assignProcessDefinition} = this.props.processDefinition;

    // TODO: Remove the <br/>s!
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
              <h4>{t('Assign samples to a workflow')}</h4>
            </div>

            <div className="stream-tag-filter">
              <h6 className="nav-header">Preset</h6>
              <SelectControl
                onChange={preset => this.props.processAssignSelectPreset(preset.value)}
                placeholder="Select a preset of workflow and variables"
                options={presets}
                value={assignPreset}
              />
            </div>
            <br />
            <div className="stream-tag-filter">
              <h6 className="nav-header">Workflow</h6>
              <SelectControl
                onChange={sel => this.props.processAssignSelectProcess(sel.value)}
                placeholder="Select a workflow or subprocess"
                options={processDefinitions}
                value={assignProcessDefinition ? assignProcessDefinition.id : null}
              />
            </div>
            <br />
            {this.renderSettings()}

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-default"
                disabled={this.props.process.saving}
                onClick={this.onToggle}
              >
                {t('Cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={this.props.process.saving}
              >
                {t('Assign')}
              </button>
            </div>
          </form>
        </Modal>
      </React.Fragment>
    );
  },
});

const mapStateToProps = state => {
  return {
    processDefinition: state.processDefinition,
    substanceSearchEntry: state.substanceSearchEntry,
    process: state.process,
  };
};

const mapDispatchToProps = dispatch => ({
  processDefinitionsGet: () => dispatch(processDefinitionsGet()),
  processesPost: (definitionId, variables, instances) =>
    dispatch(processesPost(definitionId, variables, instances)),

  processAssignSelectPreset: preset => dispatch(processAssignSelectPreset(preset)),
  processAssignSelectProcess: process => dispatch(processAssignSelectProcess(process)),
  processAssignSetVariable: (key, value) =>
    dispatch(processAssignSetVariable(key, value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AssignToWorkflowButton);
