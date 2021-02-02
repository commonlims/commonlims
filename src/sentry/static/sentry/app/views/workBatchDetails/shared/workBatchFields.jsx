import React from 'react';

import PropTypes from 'prop-types';
import {GenericField, FormState} from 'app/components/forms';
import withOrganization from 'app/utils/withOrganization';
import {connect} from 'react-redux';
import LoadingIndicator from 'app/components/loadingIndicator';
import {workBatchDetailsActions} from 'app/redux/actions/workBatchDetailsEntry';
import {merge} from 'lodash';

function WorkBatchFieldsWrapper(props) {
  // Wrap component in order to get initCurrentFieldValues into test
  const extendedProps = {
    ...props,
    initCurrentFieldValues,
  };
  return <WorkBatchFields {...extendedProps} />;
}

class WorkBatchFields extends React.Component {
  componentDidMount() {
    let {workBatch, workDefinition} = this.props;
    const currentFieldValues = this.props.initCurrentFieldValues(
      workBatch,
      workDefinition
    );
    this.props.updateLocalChanges(currentFieldValues);
  }

  handleChange(field, value) {
    let {currentFieldValues} = this.props;
    currentFieldValues = currentFieldValues ? currentFieldValues : {};
    currentFieldValues[field.prop_name] = value;
    this.props.updateLocalChanges(currentFieldValues);
  }

  renderFields() {
    let {currentFieldValues} = this.props;
    return this.props.workDefinition.fields.map((field) => {
      const config = {
        label: field.caption,
        name: field.prop_name,
        type: field.type,
      };
      return (
        <GenericField
          formData={currentFieldValues}
          formState={FormState.READY}
          key={field.prop_name}
          config={config}
          onChange={(value) => this.handleChange(field, value)}
        />
      );
    });
  }

  isInitiated = () => {
    let {workDefinition, workBatch, currentFieldValues} = this.props;
    return workDefinition && workBatch && currentFieldValues;
  };

  render() {
    if (!this.isInitiated()) {
      return <LoadingIndicator />;
    }
    return (
      <div className="row">
        <div className="col-md-6">{this.renderFields()}</div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  workDefinition: state.workDefinitionDetailsEntry.resource,
  workBatch: state.workBatchDetailsEntry.resource,
  currentFieldValues: state.workBatchDetailsEntry.localChanges,
});

const mapDispatchToProps = (dispatch) => ({
  updateLocalChanges: (currentFieldValues) => {
    return dispatch(workBatchDetailsActions.updateLocal(currentFieldValues));
  },
});

export const initCurrentFieldValues = (workBatch, workDefinition) => {
  let {fields} = workDefinition;
  let emptyFields = fields.reduce((previous, field) => {
    return {
      ...previous,
      [field.prop_name]: null,
    };
  }, {});
  let propertyNames = Object.keys(workBatch.properties);
  let populatedFields = propertyNames.reduce((previous, attr) => {
    return {
      ...previous,
      [attr]: workBatch.properties[attr].value,
    };
  }, {});
  return merge({}, emptyFields, populatedFields);
};

WorkBatchFields.propTypes = {
  initCurrentFieldValues: PropTypes.func.isRequired,
};

export default withOrganization(
  connect(mapStateToProps, mapDispatchToProps)(WorkBatchFieldsWrapper)
);
